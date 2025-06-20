"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const genres = [
  {
    value: "biography",
    label: "Biography",
  },
  {
    value: "fiction",
    label: "Fiction",
  },
  {
    value: "crime",
    label: "Crime",
  },
  {
    value: "mystery",
    label: "Mystery",
  },
  {
    value: "romance",
    label: "Romance",
  },
  {
    value: "novel",
    label: "Novel",
  },
  {
    value: "sports",
    label: "Sports",
  },
  {
    value: "educational",
    label: "Educational",
  },
  {
    value: "kids",
    label: "Kids",
  },
];

type ComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
};

export function Combobox({ value, onChange, name }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  //const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between bg-bone font-raleway text-blackolive"
        >
          {value
            ? genres.find((genre) => genre.value === value)?.label
            : "Select genre..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command className="bg-bone">
          <CommandInput placeholder="Search genre..." />
          <CommandList>
            <CommandEmpty className="ml-1">No genre found.</CommandEmpty>
            <CommandGroup>
              {genres.map((genre) => (
                <CommandItem
                  key={genre.value}
                  value={genre.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === genre.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {genre.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
