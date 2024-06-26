import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "./ui/button";
import { GetStaticProps } from "next";
import { Pool } from 'pg';

// PostgreSQL connection setup
const pool = new Pool({
  host: 'localhost',
  port: 5434,
  user: 'postgres',
  password: 'foobar',
  database: 'postgres',
});

const CustomCheckbox = ({ label, name }: { label: string; name: string }) => {
  const { register, watch } = useFormContext();
  const checked: boolean = watch(name);

  return (
    <label
      data-checked={checked}
      className="border border-gray-700 py-2 px-2 text-center h-16 flex justify-center items-center bg-white rounded-sm data-[checked=true]:bg-gray-700 data-[checked=true]:text-white"
    >
      <input
        {...register(name)}
        checked={checked || false}
        className="hidden"
        type="checkbox"
      />
      <span className="checkbox-mark"></span>
      {label}
    </label>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  let wasteTypes: string[] = [];
  let moreWasteTypes: string[] = [];

  try {
    const client = await pool.connect();

    // Fetch first 10 waste types
    const result = await client.query(`
      SELECT material_name 
      FROM recycler.materials 
      ORDER BY material_name 
      LIMIT 10
    `);
    wasteTypes = result.rows.map(row => row.material_name);

    // Fetch the rest of the waste types
    const moreResult = await client.query(`
      SELECT material_name 
      FROM recycler.materials 
      ORDER BY material_name 
      OFFSET 10
    `);
    moreWasteTypes = moreResult.rows.map(row => row.material_name);

    client.release();
  } catch (err) {
    console.error("Error fetching data from PostgreSQL:", err);
  }

  return {
    props: {
      wasteTypes,
      moreWasteTypes,
    },
  };
};

const Materials = ({ wasteTypes, moreWasteTypes }: { wasteTypes: string[]; moreWasteTypes: string[] }) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {wasteTypes.map((type, i) => (
          <CustomCheckbox key={i} label={type} name={`materials.${type}`} />
        ))}
        {showMore &&
          moreWasteTypes.map((type, i) => (
            <CustomCheckbox key={i} label={type} name={`materials.${type}`} />
          ))}
      </div>
      <div className="flex justify-center mb-28">
        <Button
          className="flex flex-col p-4 h-auto"
          onClick={() => setShowMore(!showMore)}
          variant="ghost"
        >
          {showMore && (
            <span>
              <ChevronUpIcon />
            </span>
          )}
          {showMore ? "Näytä vähemmän materiaaleja" : "Näytä lisää materiaaleja"}
          {!showMore && (
            <span>
              <ChevronDownIcon />
            </span>
          )}
        </Button>
      </div>
    </>
  );
};

export default Materials;
