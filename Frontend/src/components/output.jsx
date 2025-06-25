const Output = ({ output }) => {
  return (
      <div className="p-4 bg-black text-white h-full rounded-md">
          <h3 className="font-bold text-lg">Output:</h3>
          <hr className="my-4 border border-gray-500" />
          <pre className="whitespace-pre-wrap">{output}</pre>
      </div>
  );
};

export default Output;
