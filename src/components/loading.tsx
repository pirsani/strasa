"use client";
import { useIsLoading } from "@/hooks/use-loading";
import { Loader } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Debounce hook to limit how often the loading state can change
function useDebounce(value: boolean, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const LoadingIndicator = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsLoading, isLoading } = useIsLoading();
  const [isVisible, setIsVisible] = useState(false);
  const debouncedIsLoading = useDebounce(isLoading, 300); // Debounce loading state

  useEffect(() => {
    const url = `${pathname}?${searchParams}`;
    //console.log("url to", url);
    // You can now use the current URL
    // ...
    setIsLoading(false);
    // Reset loading state after a short delay to prevent flicker
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    // Show loader with a slight delay to avoid flicker
    if (debouncedIsLoading) {
      setIsVisible(true);
    } else {
      // Hide loader immediately after loading is done
      setIsVisible(false);
    }
  }, [debouncedIsLoading]);

  if (!isVisible) {
    return null;
  }

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
      <Loader className="w-16 h-16 animate-spin text-gray-300" />
    </div>
  );
};

export default LoadingIndicator;
