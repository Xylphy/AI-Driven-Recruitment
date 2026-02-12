"use client";

export default function ListInputSection({
  items,
  update,
  deleteItem,
  add,
  title,
}: {
  items: { id: number; title: string }[];
  update: (id: number, value: string) => void;
  deleteItem: (id: number) => void;
  add: () => void;
  title: string;
}) {
  const baseId = title.toLowerCase().trim().replace(/\s+/g, "-");

  return (
    <div className="mb-4">
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-1">
          {title}
        </legend>

        {items.map((value, index) => {
          const inputId = `${baseId}-${value.id}`;

          return (
            <div key={value.id} className="flex items-center gap-2 mb-2">
              <label htmlFor={inputId} className="sr-only">
                {title} {index + 1}
              </label>

              <input
                id={inputId}
                type="text"
                value={value.title}
                onChange={(e) => update(value.id, e.target.value)}
                placeholder={`Enter ${title.toLowerCase()}`}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />

              <button
                type="button"
                onClick={() => deleteItem(value.id)}
                className="text-sm text-red-600 underline"
              >
                Delete
              </button>
            </div>
          );
        })}

        <button
          className="text-red-600 text-sm cursor-pointer hover:underline"
          onClick={add}
          type="button"
        >
          Add {title}
        </button>
      </fieldset>
    </div>
  );
}
