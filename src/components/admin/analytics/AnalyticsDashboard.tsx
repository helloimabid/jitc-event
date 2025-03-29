import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar, Users, Award, TrendingUp, Filter, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEvents } from '@/services/eventService';
import { getRegistrations } from '@/services/registrationService';
import type { Event, Registration } from '@/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AnalyticsDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, registrationsData] = await Promise.all([
        getEvents(),
        getRegistrations()
      ]);
      
      setEvents(eventsData);
      setRegistrations(registrationsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter data based on time range
  const getFilteredData = () => {
    if (timeRange === 'all') {
      return { events, registrations };
    }
    
    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === '7days') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === '30days') {
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === '90days') {
      startDate.setDate(now.getDate() - 90);
    }
    
    const filteredEvents = events.filter(event => 
      new Date(event.date) >= startDate && new Date(event.date) <= now
    );
    
    const filteredRegistrations = registrations.filter(reg => 
      new Date(reg.timestamp) >= startDate && new Date(reg.timestamp) <= now
    );
    
    return { events: filteredEvents, registrations: filteredRegistrations };
  };
  
  const { events: filteredEvents, registrations: filteredRegistrations } = getFilteredData();
  
  // Calculate summary metrics
  const totalEvents = filteredEvents.length;
  const totalRegistrations = filteredRegistrations.length;
  const completedPayments = filteredRegistrations.filter(reg => reg.paymentStatus === 'completed').length;
  const pendingPayments = filteredRegistrations.filter(reg => reg.paymentStatus === 'pending').length;
  
  // Calculate revenue
  const totalRevenue = filteredRegistrations
    .filter(reg => reg.paymentStatus === 'completed')
    .reduce((sum, reg) => {
      const event = events.find(e => e.id === reg.eventId);
      if (event?.fee) {
        return sum + event.fee;
      }
      return sum;
    }, 0);
  
  // Prepare data for charts
  const eventsByCategory = filteredEvents.reduce((acc: Record<string, number>, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {});
  
  const eventCategoryData = Object.entries(eventsByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));
  
  // Registration data by event
  const registrationsByEvent = filteredRegistrations.reduce((acc: Record<string, number>, reg) => {
    acc[reg.eventId] = (acc[reg.eventId] || 0) + 1;
    return acc;
  }, {});
  
  const topEvents = Object.entries(registrationsByEvent)
    .map(([eventId, count]) => ({
      eventId,
      count,
      name: events.find(e => e.id === eventId)?.title || 'Unknown Event'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Registration trend data (by day)
  const registrationTrend = filteredRegistrations.reduce((acc: Record<string, number>, reg) => {
    const date = new Date(reg.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  
  const trendData = Object.entries(registrationTrend)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Payment status data
  const paymentStatusData = [
    { name: 'Completed', value: completedPayments },
    { name: 'Pending', value: pendingPayments },
    { name: 'Failed', value: filteredRegistrations.filter(reg => reg.paymentStatus === 'failed').length }
  ].filter(item => item.value > 0);
  
  // Export analytics data as CSV
  const exportData = () => {
    // Create data arrays for different sections
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Events', totalEvents.toString()],
      ['Total Registrations', totalRegistrations.toString()],
      ['Completed Payments', completedPayments.toString()],
      ['Pending Payments', pendingPayments.toString()],
      ['Total Revenue', totalRevenue.toFixed(2)],
      ['Conversion Rate', totalRegistrations > 0 ? ((completedPayments / totalRegistrations) * 100).toFixed(1) + '%' : '0%']
    ];
    
    const eventCategoryCSV = [
      ['Category', 'Count'],
      ...eventCategoryData.map(item => [item.name, item.value.toString()])
    ];
    
    const topEventsCSV = [
      ['Event Name', 'Registrations'],
      ...topEvents.map(item => [item.name, item.count.toString()])
    ];
    
    const trendDataCSV = [
      ['Date', 'Registrations'],
      ...trendData.map(item => [item.date, item.count.toString()])
    ];
    
    // Combine all data into one CSV
    const allData = [
      ['JITC Analytics Dashboard - ' + new Date().toLocaleDateString()],
      ['Time Range: ' + (timeRange === 'all' ? 'All Time' : 
                       timeRange === '7days' ? 'Last 7 Days' : 
                       timeRange === '30days' ? 'Last 30 Days' : 'Last 90 Days')],
      [''],
      ['SUMMARY METRICS'],
      ...summaryData,
      [''],
      ['EVENTS BY CATEGORY'],
      ...eventCategoryCSV,
      [''],
      ['TOP EVENTS BY REGISTRATION'],
      ...topEventsCSV,
      [''],
      ['REGISTRATION TREND'],
      ...trendDataCSV
    ];
    
    // Convert to CSV format
    const csvContent = allData.map(row => row.join(',')).join('\n');
    
    // Create a Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jitc-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={fetchData} title="Refresh data">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportData} className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden xs:inline">Export</span>
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-gray-500 mt-1">
              {timeRange !== 'all' ? `In the selected period` : 'All time'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-gray-500 mt-1">
              {completedPayments} completed / {pendingPayments} pending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Award className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              From {completedPayments} paid registrations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRegistrations > 0 
                ? `${((completedPayments / totalRegistrations) * 100).toFixed(1)}%` 
                : '0%'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Completed payments / Total registrations
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different analytics views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Registration Trend</CardTitle>
                <CardDescription>Number of registrations over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70} 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Registrations" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No registration data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
                <CardDescription>Distribution of payment statuses</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {paymentStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No payment data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Events by Registration</CardTitle>
              <CardDescription>Events with the most registrations</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {topEvents.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topEvents}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" name="Registrations" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No event registration data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>Registration Details</CardTitle>
              <CardDescription>Detailed registration analytics coming soon</CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Detailed Registration Analytics</h3>
                <p className="text-gray-500 max-w-md">
                  More detailed registration analytics will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Events by Category</CardTitle>
                <CardDescription>Distribution of events by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {eventCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {eventCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No event category data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Event Timeline</CardTitle>
                <CardDescription>Events scheduled over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Event Timeline Visualization</h3>
                  <p className="text-gray-500 max-w-md">
                    A visual timeline of events will be available in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
