import React, { useState, useRef, useEffect } from "react";

export default function Dashboard() {
  const options = ["All", "LinkedIn", "Twitter", "Facebook"];
  const [selected, setSelected] = useState("All");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to prefix titles
  const title = (base) => (selected === "All" ? base : `${selected} ${base}`);

  // Helper to generate chart IDs
  const chartId = (base) =>
    `${selected === "All" ? base : selected.toLowerCase() + "-" + base}`;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Dropdown Trigger */}
      <div className="max-w-7xl mx-auto mb-6 relative" ref={dropdownRef}>
        <button
          className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 inline-flex items-center"
          onClick={() => setOpen(!open)}
        >
          {selected === "All" ? "Choose your Social Media" : selected}
          <svg
            className="w-2.5 m-2.5 ms-1.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
            aria-hidden="true"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
            <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
              {options.map((opt) => (
                <li key={opt}>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSelected(opt);
                      setOpen(false);
                    }}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Analytics Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        {/* 1) Users This Week */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between">
            <div>
              <h5 className="text-3xl font-bold text-gray-900 dark:text-white pb-2">
                {title("Users this week")}
              </h5>
              <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                {title("active users")}
              </p>
            </div>
            <div className="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500">
              12%
              <svg
                className="w-3 h-3 ms-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 14"
                aria-hidden="true"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13V1m0 0L1 5m4-4 4 4"
                />
              </svg>
            </div>
          </div>

          {/* Chart placeholder */}
          <div
            id={chartId("area-chart")}
            className="mt-4 h-32 bg-gray-50 dark:bg-gray-700 rounded-md"
          />

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center">
              <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 inline-flex items-center">
                Last 7 days
                <svg
                  className="w-2.5 m-2.5 ms-1.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                  aria-hidden="true"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              <a
                href="#"
                className="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-600 hover:text-blue-700 hover:bg-gray-100 dark:hover:text-blue-500 dark:hover:bg-gray-700 px-3 py-2"
              >
                {title("Report")}
                <svg
                  className="w-2.5 h-2.5 ms-1.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                  aria-hidden="true"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 2) Website Traffic */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-xl font-bold text-gray-900 dark:text-white">
              {title("Website traffic")}
            </h5>
            <svg
              data-popover-target="chartInfo"
              data-popover-placement="bottom"
              className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z" />
            </svg>
          </div>

          {/* Chart placeholder */}
          <div
            id={chartId("traffic-chart")}
            className="h-32 bg-gray-50 dark:bg-gray-700 rounded-md"
          />

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center">
              <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 inline-flex items-center">
                31 Nov – 31 Dec
                <svg
                  className="w-2.5 m-2.5 ms-1.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                  aria-hidden="true"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              <a
                href="#"
                className="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-600 hover:text-blue-700 hover:bg-gray-100 dark:hover:text-blue-500 dark:hover:bg-gray-700 px-3 py-2"
              >
                {title("Traffic Report")}
                <svg
                  className="w-2.5 h-2.5 ms-1.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                  aria-hidden="true"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 3) Profit & Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
            <dl>
              <dt className="text-base font-normal text-gray-500 dark:text-gray-400 pb-1">
                Profit
              </dt>
              <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                $5,405
              </dd>
            </dl>
            <span className="bg-green-100 text-green-800 text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md dark:bg-green-900 dark:text-green-300">
              <svg
                className="w-2.5 h-2.5 me-1.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 14"
                aria-hidden="true"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13V1m0 0L1 5m4-4 4 4"
                />
              </svg>
              Profit rate 23.5%
            </span>
          </div>

          <div className="grid grid-cols-2 py-3">
            <dl>
              <dt className="text-base font-normal text-gray-500 dark:text-gray-400 pb-1">
                Income
              </dt>
              <dd className="text-xl font-bold text-green-500 dark:text-green-400">
                $23,635
              </dd>
            </dl>
            <dl>
              <dt className="text-base font-normal text-gray-500 dark:text-gray-400 pb-1">
                Expense
              </dt>
              <dd className="text-xl font-bold text-red-600 dark:text-red-500">
                -$18,230
              </dd>
            </dl>
          </div>

          {/* Chart placeholder */}
          <div
            id={chartId("bar-chart")}
            className="h-32 bg-gray-50 dark:bg-gray-700 rounded-md"
          />

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center">
              <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 inline-flex items-center">
                Last 6 months
                <svg
                  className="w-2.5 m-2.5 ms-1.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                  aria-hidden="true"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              <a
                href="#"
                className="uppercase text-sm font-semibold inline-flex items-center rounded-lg text-blue-600 hover:text-blue-700 hover:bg-gray-100 dark:hover:text-blue-500 dark:hover:bg-gray-700 px-3 py-2"
              >
                {title("Revenue Report")}
                <svg
                  className="w-2.5 h-2.5 ms-1.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                  aria-hidden="true"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
