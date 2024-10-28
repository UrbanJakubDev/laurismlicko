import React from 'react'

type Props = {
   label: string
   value: string | number
   units?: string
}

const StatsItem = (props: Props) => {
   return (
      <div className="bg-baby-rose/20 p-4 rounded-xl text-center drop-shadow-sm border border-white">
         <p className="text-sm text-baby-soft mb-1">{props.label}</p>
         <p className="text-xl font-semibold">{props.value} {props.units || ""}</p>
      </div>
   )
}

export default StatsItem