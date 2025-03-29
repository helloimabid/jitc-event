"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { UserPlus, Trash2, RefreshCw, AlertCircle, Eye, EyeOff, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
  updateAdminPassword,
  getCurrentAdmin,
  getCurrentAdminDetails,
  isCurrentAdminSuperAdmin,
} from "@/services/authService"

// Define AdminUser interface if not already defined in your types
interface AdminUser {
  id: string
  username: string
  created_at: string
  email?: string
  role?: string
}

const AdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null)
  const [adminToUpdatePassword, setAdminToUpdatePassword] = useState<AdminUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [currentAdminDetails, setCurrentAdminDetails] = useState<AdminUser | null>(null)

  const currentAdmin = getCurrentAdmin()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm()
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
    watch: watchPassword,
  } = useForm()

  const password = watch("password")
  const newPassword = watchPassword("newPassword")

  useEffect(() => {
    fetchAdminData()
    checkAdminRole()
    fetchCurrentAdminDetails()
  }, [])

  // Fetch all admin users from the database
  const fetchAdminData = async () => {
    setIsLoading(true)
    try {
      const adminUsers = await getAdminUsers()
      setAdmins(adminUsers)
    } catch (error) {
      toast.error("Failed to load admin users")
    } finally {
      setIsLoading(false)
    }
  }

  const checkAdminRole = async () => {
    try {
      const isAdminSuperAdmin = await isCurrentAdminSuperAdmin()
      setIsSuperAdmin(isAdminSuperAdmin)
    } catch (error) {
      // Silent fail
    }
  }

  const fetchCurrentAdminDetails = async () => {
    try {
      const adminDetails = await getCurrentAdminDetails()
      setCurrentAdminDetails(adminDetails)
    } catch (error) {
      // Silent fail
    }
  }

  const handleAddAdmin = async (data: any) => {
    setIsLoading(true)
    try {
      const success = await createAdminUser(data.username, data.password, data.email || undefined, data.role || "admin")

      if (success) {
        toast.success("Admin user created successfully")
        setShowAddDialog(false)
        reset()
        fetchAdminData()
      } else {
        toast.error("Failed to create admin user")
      }
    } catch (error) {
      console.error("Error creating admin:", error)
      toast.error("An error occurred while creating admin user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return

    setIsLoading(true)
    try {
      const success = await deleteAdminUser(adminToDelete.id)

      if (success) {
        toast.success(`Admin user ${adminToDelete.username} deleted successfully`)
        setShowDeleteDialog(false)
        setAdminToDelete(null)
        fetchAdminData()
      } else {
        toast.error("Failed to delete admin user")
      }
    } catch (error) {
      console.error("Error deleting admin:", error)
      toast.error("An error occurred while deleting admin user")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePassword = async (data: any) => {
    if (!adminToUpdatePassword) return

    setIsLoading(true)
    try {
      const success = await updateAdminPassword(adminToUpdatePassword.id, data.newPassword)

      if (success) {
        toast.success(`Password updated successfully for ${adminToUpdatePassword.username}`)
        setShowPasswordDialog(false)
        setAdminToUpdatePassword(null)
        resetPassword()
      } else {
        toast.error("Failed to update password")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error("An error occurred while updating password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Users</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && admins.length === 0
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))
          : admins.map((admin) => (
              <Card key={admin.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {admin.username}
                        {admin.role === "super_admin" && <Shield className="ml-1 h-4 w-4 text-blue-500" />}
                      </CardTitle>
                      <CardDescription>{new Date(admin.created_at).toLocaleDateString()}</CardDescription>
                    </div>
                    {admin.id === currentAdmin?.id && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {admin.email && <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{admin.email}</p>}
                  <p className="text-sm">
                    Role: <span className="font-medium">{admin.role || "admin"}</span>
                    {admin.role === "super_admin" && <Shield className="ml-1 h-4 w-4 text-blue-500" />}
                    
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  {/* Show password reset button only for current admin or for super admins */}
                  {(admin.id === currentAdmin?.id || isSuperAdmin) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAdminToUpdatePassword(admin)
                        setShowPasswordDialog(true)
                      }}
                    >
                      <RefreshCw className="mr-1 h-3.5 w-3.5" />
                      Password
                    </Button>
                  )}

                  {admin.id !== currentAdmin?.id && isSuperAdmin && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setAdminToDelete(admin)
                        setShowDeleteDialog(true)
                      }}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
      </div>

      {admins.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <Shield className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No admin users found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Add your first admin user to get started.</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Admin
          </Button>
        </div>
      )}

      {/* Add Admin Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>Create a new administrator account with secure credentials.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleAddAdmin)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                {...register("username", {
                  required: "Username is required",
                  minLength: { value: 3, message: "Username must be at least 3 characters" },
                })}
              />
              {errors.username && <p className="text-sm text-red-500">{errors.username.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                defaultValue="admin"
                onValueChange={(value) => register("role").onChange({ target: { value, name: "role" } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message as string}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === password || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message as string}</p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Admin User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the admin user "{adminToDelete?.username}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2 py-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              All permissions and access for this user will be permanently removed.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
            <DialogDescription>Set a new password for {adminToUpdatePassword?.username}.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPassword(handleUpdatePassword)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  {...registerPassword("newPassword", {
                    required: "New password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500">{passwordErrors.newPassword.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...registerPassword("confirmNewPassword", {
                    required: "Please confirm your new password",
                    validate: (value) => value === newPassword || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmNewPassword && (
                <p className="text-sm text-red-500">{passwordErrors.confirmNewPassword.message as string}</p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminManagement
