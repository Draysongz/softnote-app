import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Welcome = () => {
  return (
    <div className='bg-[#06070a] min-h-screen h-full pt-16' style={{ backgroundImage: "url('/bgframe.png')", backgroundSize: "cover", backgroundRepeat: "no-repeat"}}>
      <p className='text-gray-300 text-lg text-center'>Welcome!</p>
      <p className='text-center text-3xl text-white pb-16'>Tap a coin and<br/> get rewards</p>
      <Image 
        src={"/coiner.svg"}
        width={250}
        height={250}
        alt='Coins'
        className='mb-4 mx-auto'
      />
      <p className='text-gray-400 text-center pb-8 pt-6'>All your achievements in the game will be converted into *** tokens</p>
      <Link href={"/home"} className='bg-[#487bff] flex justify-center mx-auto border border-[#487bff] w-10/12 text-center py-3 rounded-md text-white'>Got it</Link>
    </div>
  )
}

export default Welcome
