// frontend/src/components/ui/Spinner.jsx
const Spinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
        className={`${sizes[size]} animate-spin rounded-full
          border-4 border-gray-200 border-t-blue-600`}
      />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
};

export default Spinner;