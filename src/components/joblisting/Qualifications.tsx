"use client";

export default function ListInputSection({
  items,
  update,
  deleteItem,
  add,
  title,
  readOnly = false,
}: {
  items: { id: number; title: string }[];
  update: (id: number, value: string) => void;
  deleteItem: (id: number) => void;
  add: () => void;
  title: string;
  readOnly?: boolean;
}) {
  const baseId = title.toLowerCase().trim().replace(/\s+/g, "-");

  return (
    <div className="mb-8">
      <fieldset
        className="
      relative
      rounded-3xl
      border border-white/40
      bg-white/55
      backdrop-blur-2xl
      shadow-[0_25px_80px_rgba(220,38,38,0.08)]
      p-6
      overflow-hidden
    "
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-red-100/20 pointer-events-none" />

        <div className="relative">
          <legend className="text-xs font-bold uppercase tracking-[0.2em] text-red-600 mb-2">
            {title}
          </legend>

          {readOnly && (
            <p className="text-xs text-gray-500 italic mb-4">
              Tags cannot be edited after job creation.
            </p>
          )}

          <div className="space-y-3">
            {items.map((value, index) => {
              const inputId = `${baseId}-${value.id}`;

              return (
                <div
                  key={value.id}
                  className="
                flex items-center gap-3
                rounded-2xl
                border border-white/40
                bg-white/70
                backdrop-blur-xl
                px-4 py-3
                shadow-[0_10px_35px_rgba(220,38,38,0.06)]
                transition-all duration-300
              "
                >
                  <label htmlFor={inputId} className="sr-only">
                    {title} {index + 1}
                  </label>

                  <input
                    id={inputId}
                    type="text"
                    value={value.title}
                    onChange={
                      readOnly
                        ? undefined
                        : (e) => update(value.id, e.target.value)
                    }
                    placeholder={
                      readOnly ? undefined : `Enter ${title.toLowerCase()}`
                    }
                    readOnly={readOnly}
                    disabled={readOnly}
                    required={!readOnly}
                    className={`
                  flex-1
                  bg-transparent
                  outline-none
                  text-sm font-semibold
                  ${
                    readOnly
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 placeholder:text-gray-400"
                  }
                `}
                  />

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => deleteItem(value.id)}
                      className="
                    rounded-xl
                    px-3 py-1.5
                    text-xs font-bold uppercase tracking-[0.15em]
                    text-red-600
                    bg-white/60
                    border border-white/40
                    backdrop-blur-md
                    shadow-sm
                    hover:bg-red-600 hover:text-white
                    transition-all duration-300
                  "
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {!readOnly && (
            <button
              onClick={add}
              type="button"
              className="
            mt-4
            inline-flex items-center
            rounded-2xl
            px-5 py-2.5
            text-xs font-bold uppercase tracking-[0.18em]
            bg-gradient-to-r from-red-600 to-red-500
            text-white
            shadow-[0_15px_50px_rgba(220,38,38,0.18)]
            hover:scale-[1.03]
            transition-all duration-300
          "
            >
              Add {title}
            </button>
          )}
        </div>
      </fieldset>
    </div>
  );
}
