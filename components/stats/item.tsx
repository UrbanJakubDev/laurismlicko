import React from 'react'

type Props = {
   label: string
   value: string | number
   units?: string
}

const StatsItem = (props: Props) => {
   return (
      <div className="p-4 rounded-xl text-center ">
         <p className="text-sm text-baby-text mb-1">{props.label}</p>
         <p className="text-xl font-semibold text-baby-accent">{props.value} {props.units || ""}</p>
      </div>
   )
}

export default StatsItem