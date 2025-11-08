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
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {title}
      </label>
      {items.map((value) => (
        <div key={value.id} className="flex items-center gap-2 mb-2">
          <input
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
      ))}
      <p
        onClick={add}
        className="text-red-600 text-sm cursor-pointer hover:underline"
      >
        Add {title}
      </p>
    </div>
  );
}
