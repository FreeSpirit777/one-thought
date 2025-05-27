"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import useDebounce from "@/hooks/useDebounce";

interface MultiSelectOption {
	value: string;
	label: string;
}

interface MultiSelectProps {
	options: MultiSelectOption[];
	selected: string[];
	onChange: (selected: string[]) => void;
	placeholder?: string;
	className?: string;
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = "Select tags...",
	className,
}: MultiSelectProps) {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null); // Reference for the Input component
	const commandRef = useRef<HTMLDivElement>(null); // Reference for the Command component
	const debouncedInputValue = useDebounce(inputValue, 300);

	// Calculate filtered options
	const filteredOptions = useMemo(
		() =>
			options.filter(
				(option) =>
					!selected.includes(option.value) &&
					option.label
						.toLowerCase()
						.includes(inputValue.toLowerCase())
			),
		[options, selected, inputValue]
	);

	// Open/Close Popover based on input value
	useEffect(() => {
		if (debouncedInputValue) {
			setOpen(true);
		} else {
			setOpen(false);
		}
	}, [debouncedInputValue]);

	// Set focus on input field and highlight first option when Popover is opened
	useEffect(() => {
		if (open) {
			const timeout = setTimeout(() => {
				inputRef.current?.focus();
				// Automatically highlight the first option
				if (commandRef.current && filteredOptions.length > 0) {
					const firstItem = commandRef.current.querySelector(
						"[cmdk-item]:not([data-disabled=true])"
					);
					if (firstItem) {
						firstItem.setAttribute("data-selected", "true");
					}
				}
			}, 0);
			return () => clearTimeout(timeout);
		}
	}, [open, filteredOptions]);

	const handleSelect = (label: string) => {
		const option = options.find((opt) => opt.label === label);
		if (!option || selected.includes(option.value)) return;
		onChange([...selected, option.value]);
		setInputValue("");
		setOpen(false);
		inputRef.current?.focus();
	};

	const handleRemove = (value: string) => {
		onChange(selected.filter((item) => item !== value));
		inputRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && filteredOptions.length > 0) {
			e.preventDefault();
			// Find the currently highlighted option
			const selectedItem = commandRef.current?.querySelector(
				"[cmdk-item][data-selected=true]"
			);
			if (selectedItem) {
				const label = selectedItem.getAttribute("data-value");
				if (label) {
					handleSelect(label);
				}
			} else if (filteredOptions.length > 0) {
				// Fallback: Select the first option
				handleSelect(filteredOptions[0].label);
			}
		} else if (e.key === "Escape") {
			e.preventDefault();
			setOpen(false);
			setInputValue("");
		} else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			setOpen(true);
			if (commandRef.current) {
				// Simulate arrow key event for cmdk
				const event = new KeyboardEvent("keydown", {
					key: e.key,
					bubbles: true,
				});
				commandRef.current.dispatchEvent(event);
				// Ensure an option is highlighted
				const selectedItem = commandRef.current.querySelector(
					"[cmdk-item][data-selected=true]"
				);
				if (!selectedItem && filteredOptions.length > 0) {
					const firstItem = commandRef.current.querySelector(
						"[cmdk-item]:not([data-disabled=true])"
					);
					if (firstItem) {
						firstItem.setAttribute("data-selected", "true");
					}
				}
			}
		}
	};

	return (
		<div className={cn("relative", className)}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<div
						className="flex flex-wrap items-center gap-1 border border-input bg-background rounded-md p-2 text-sm min-h-[40px] cursor-text"
						onClick={() => inputRef.current?.focus()}
					>
						{selected.map((value) => {
							const option = options.find(
								(opt) => opt.value === value
							);
							return (
								<Badge
									key={value}
									variant="secondary"
									className="flex items-center gap-1"
								>
									{option?.label || value}
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											handleRemove(value);
										}}
										className="p-0 m-0 h-3 w-3 flex items-center justify-center"
										aria-label={`Entferne ${
											option?.label || value
										}`}
									>
										<XCircle className="h-3 w-3 cursor-pointer" />
									</button>
								</Badge>
							);
						})}
						<input
							ref={inputRef}
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={
								selected.length === 0 ? placeholder : ""
							}
							className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm"
						/>
					</div>
				</PopoverTrigger>
				<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 mt-1 z-50">
					<Command
						ref={commandRef}
						filter={(value, search) => {
							const option = options.find(
								(opt) => opt.label === value
							);
							if (!option) return 0;
							return option.label
								.toLowerCase()
								.includes(search.toLowerCase())
								? 1
								: 0;
						}}
					>
						<CommandList>
							<CommandEmpty>No Tags found.</CommandEmpty>
							<CommandGroup>
								{filteredOptions.map((option) => (
									<CommandItem
										key={option.value}
										value={option.label}
										onSelect={() =>
											handleSelect(option.label)
										}
										className="data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
									>
										{option.label}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}
