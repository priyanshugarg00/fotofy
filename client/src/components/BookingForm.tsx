import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BookingFormProps {
  photographer: any;
  onSubmit: (data: any) => void;
}

const BookingForm = ({ photographer, onSubmit }: BookingFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Fetch availability for the photographer
  const { data: availability, isLoading: isAvailabilityLoading } = useQuery({
    queryKey: [`/api/photographers/${photographer.id}/availability`],
    enabled: !!photographer.id,
    queryFn: async () => {
      const response = await fetch(`/api/photographers/${photographer.id}/availability`);
      if (!response.ok) throw new Error("Failed to fetch availability");
      return response.json();
    },
  });
  
  // Get available dates from availability data
  const availableDates = availability?.reduce((dates: Date[], slot: any) => {
    if (!slot.isBooked) {
      const date = new Date(slot.date);
      // Check if date already exists in the array
      if (!dates.some(d => d.toDateString() === date.toDateString())) {
        dates.push(date);
      }
    }
    return dates;
  }, []) || [];
  
  // Get available time slots for selected date
  const getAvailableTimeSlots = (date: Date | undefined) => {
    if (!date || !availability) return [];
    
    const formattedDate = format(date, "yyyy-MM-dd");
    return availability.filter((slot: any) => 
      slot.date === formattedDate && !slot.isBooked
    );
  };
  
  const availableTimeSlots = getAvailableTimeSlots(selectedDate);
  
  // Booking form schema
  const formSchema = z.object({
    bookingDate: z.date({
      required_error: "Please select a date",
    }),
    startTime: z.string({
      required_error: "Please select a time slot",
    }),
    endTime: z.string({
      required_error: "End time is required",
    }),
    location: z.string().optional(),
    notes: z.string().optional(),
  });
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingDate: undefined,
      startTime: "",
      endTime: "",
      location: "",
      notes: "",
    },
  });
  
  // Handle form submission
  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(data);
  };
  
  // Update time slots when date changes
  useEffect(() => {
    // Reset time slot selection when date changes
    form.setValue("startTime", "");
    form.setValue("endTime", "");
  }, [selectedDate, form]);
  
  // When start time is selected, automatically set end time from availability
  const handleTimeSlotChange = (value: string) => {
    const selectedSlot = availableTimeSlots.find((slot: any) => slot.startTime === value);
    if (selectedSlot) {
      form.setValue("endTime", selectedSlot.endTime);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bookingDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Select a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setSelectedDate(date);
                    }}
                    disabled={(date) => {
                      // Disable dates that are not in availableDates or are in the past
                      return (
                        date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                        !availableDates.some(
                          (availableDate) =>
                            availableDate.toDateString() === date.toDateString()
                        )
                      );
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select from available dates in the calendar
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Slot</FormLabel>
              <Select
                disabled={!selectedDate || availableTimeSlots.length === 0}
                onValueChange={(value) => {
                  field.onChange(value);
                  handleTimeSlotChange(value);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTimeSlots.map((slot: any) => (
                    <SelectItem key={`${slot.date}-${slot.startTime}`} value={slot.startTime}>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedDate && (
                <FormDescription>
                  Select a date first to see available time slots
                </FormDescription>
              )}
              {selectedDate && availableTimeSlots.length === 0 && (
                <FormDescription>
                  No time slots available for this date
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter the shoot location" {...field} />
              </FormControl>
              <FormDescription>
                Provide details about where the shoot will take place
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special requests or information for the photographer"
                  {...field}
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold text-lg mb-2">Booking Summary</h3>
          <div className="flex justify-between text-gray-700 mb-1">
            <span>Session Fee</span>
            <span>₹{photographer.baseRate.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">₹{photographer.baseRate.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={
            !form.formState.isValid || 
            form.formState.isSubmitting ||
            !selectedDate ||
            !form.getValues().startTime
          }
        >
          {form.formState.isSubmitting ? (
            <>
              <span className="animate-spin mr-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
              Processing...
            </>
          ) : (
            "Proceed to Payment"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default BookingForm;
