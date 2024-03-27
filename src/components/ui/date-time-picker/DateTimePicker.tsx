"use client";
 
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { ControllerRenderProps } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "./time-picker";
 
export function DateTimePicker({ field }: { field: ControllerRenderProps }) {

    const fieldValueAsDate = field.value instanceof Date ? field.value : new Date(field.value || Date.now());

  
 
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !fieldValueAsDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {fieldValueAsDate ? format(fieldValueAsDate, "PPP HH:mm:ss") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={fieldValueAsDate}
          onSelect={field.onChange}
          initialFocus
        />
        <div className="p-3 border-t border-border">
          <TimePicker setDate={field.onChange} date={fieldValueAsDate} />
        </div>
      </PopoverContent>
    </Popover>
  );
}