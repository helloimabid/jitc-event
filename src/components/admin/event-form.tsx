import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Trash2 } from "lucide-react";
import type { Event, EventCategory, FormField } from "@/types";

interface EventFormProps {
  event: Event | null;
  formFields: FormField[];
  onSubmit: (data: any) => Promise<void>;
  onAddFormField: () => void;
  onUpdateFormField: (index: number, field: Partial<FormField>) => void;
  onRemoveFormField: (index: number) => void;
}

export function EventForm({
  event,
  formFields,
  onSubmit,
  onAddFormField,
  onUpdateFormField,
  onRemoveFormField,
}: EventFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      category: event?.category || "competition",
      date: event?.date || "",
      location: event?.location || "",
      image: event?.image || "",
      rules: event?.rules || "",
      fee: event?.fee || "",
      capacity: event?.capacity || "",
    },
  });

  const [description, setDescription] = useState(event?.description || "");
  const [rules, setRules] = useState(event?.rules || "");

  // Update the form values when description or rules change
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setValue("description", value);
  };

  const handleRulesChange = (value: string) => {
    setRules(value);
    setValue("rules", value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          {...register("title")}
          className="w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <RichTextEditor
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Enter event description..."
          className="min-h-[200px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          {...register("category")}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          required
        >
          <option value="competition">Competition</option>
          <option value="workshop">Workshop</option>
          <option value="fest">Fest</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            {...register("date")}
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            type="text"
            {...register("location")}
            className="w-full"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          type="text"
          {...register("image")}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rules">Rules</Label>
        <RichTextEditor
          value={rules}
          onChange={handleRulesChange}
          placeholder="Enter event rules and guidelines..."
          className="min-h-[200px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fee">Fee</Label>
          <Input
            id="fee"
            type="number"
            {...register("fee")}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            {...register("capacity")}
            className="w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Form Fields</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddFormField}
          >
            Add Field
          </Button>
        </div>

        {formFields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-wrap gap-2 items-start border p-2 rounded"
          >
            <div className="grid gap-1.5 flex-1 min-w-[150px]">
              <Label htmlFor={`label_${index}`}>Label</Label>
              <Input
                id={`label_${index}`}
                type="text"
                value={field.label}
                onChange={(e) =>
                  onUpdateFormField(index, { label: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="grid gap-1.5 w-[120px]">
              <Label htmlFor={`type_${index}`}>Type</Label>
              <select
                id={`type_${index}`}
                value={field.type}
                onChange={(e) =>
                  onUpdateFormField(index, {
                    type: e.target.value as "text" | "number" | "email",
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="grid gap-1.5 w-[100px]">
              <Label htmlFor={`required_${index}`}>Required</Label>
              <div className="flex items-center h-10">
                <input
                  id={`required_${index}`}
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    onUpdateFormField(index, { required: e.target.checked })
                  }
                  className="w-4 h-4"
                />
              </div>
            </div>

            <div className="flex items-end h-[58px]">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveFormField(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">
        {event ? "Update Event" : "Create Event"}
      </Button>
    </form>
  );
}
