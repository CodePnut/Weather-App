"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  setDate,
  getDay,
  getDaysInMonth,
  startOfMonth,
  getDate,
  isSameDay,
  addDays,
  startOfWeek,
} from "date-fns";
import type { Locale } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = {
  className?: string;
  classNames?: Record<string, string>;
  selected?: Date | null;
  onSelect?: (date: Date | undefined) => void;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  showOutsideDays?: boolean;
  disabled?: (date: Date) => boolean;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

function Calendar({
  className,
  classNames,
  selected,
  onSelect,
  month = new Date(),
  onMonthChange,
  showOutsideDays = true,
  disabled,
  locale,
  weekStartsOn = 0,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(month || new Date());

  React.useEffect(() => {
    if (month) {
      setCurrentMonth(month);
    }
  }, [month]);

  const handleMonthChange = React.useCallback(
    (newMonth: Date) => {
      setCurrentMonth(newMonth);
      onMonthChange?.(newMonth);
    },
    [onMonthChange]
  );

  const nextMonth = React.useCallback(() => {
    handleMonthChange(addMonths(currentMonth, 1));
  }, [currentMonth, handleMonthChange]);

  const prevMonth = React.useCallback(() => {
    handleMonthChange(subMonths(currentMonth, 1));
  }, [currentMonth, handleMonthChange]);

  const handleDayClick = React.useCallback(
    (day: Date) => {
      onSelect?.(day);
    },
    [onSelect]
  );

  // Generate days for the calendar
  const daysOfWeek = React.useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return [...days.slice(weekStartsOn), ...days.slice(0, weekStartsOn)];
  }, [weekStartsOn]);

  const calendarDays = React.useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const monthStart = startOfMonth(currentMonth);
    const startDay = getDay(monthStart);
    const weeks = [];

    let day = startOfWeek(monthStart, { weekStartsOn });

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const cloneDay = new Date(day);
        week.push(cloneDay);
        day = addDays(day, 1);
      }
      weeks.push(week);

      // Stop if we've gone past the end of the month
      if (
        weeks.length > 0 &&
        getDate(week[6]) >= 7 &&
        getMonth(week[6]) !== getMonth(currentMonth)
      ) {
        break;
      }
    }

    return weeks;
  }, [currentMonth, weekStartsOn]);

  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-center pt-1 relative items-center">
        <button
          onClick={prevMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>

        <button
          onClick={nextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex">
          {daysOfWeek.map((day, index) => (
            <div
              key={index}
              className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center"
            >
              {day}
            </div>
          ))}
        </div>

        {calendarDays.map((week, weekIndex) => (
          <div key={weekIndex} className="flex w-full mt-2">
            {week.map((day, dayIndex) => {
              const isSelectedDay = selected ? isSameDay(day, selected) : false;
              const isCurrentMonth = getMonth(day) === getMonth(currentMonth);
              const isDayDisabled = disabled ? disabled(day) : false;

              return (
                <div
                  key={dayIndex}
                  className="h-9 w-9 text-center text-sm p-0 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleDayClick(day)}
                    disabled={isDayDisabled}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-9 w-9 p-0 font-normal",
                      isSelectedDay &&
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      !isCurrentMonth && !showOutsideDays && "invisible",
                      !isCurrentMonth &&
                        showOutsideDays &&
                        "text-muted-foreground",
                      isSameDay(day, new Date()) &&
                        !isSelectedDay &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

// Helper function to get month
function getMonth(date: Date): number {
  return date.getMonth();
}

export { Calendar };
