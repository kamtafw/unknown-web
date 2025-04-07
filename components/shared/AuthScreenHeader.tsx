import Image from 'next/image';
import React from 'react';
import AppComboLogo from '@/assets/appsCoboLogo.png'

const AuthScreenHeader = () => {
    return (
        <header className='w-full h-20 flex items-center justify-center border-t border-b border-[#ECEFF6] mx-auto'>
            <div className='w-[85%] flex items-center justify-start'>
                <Image
                    src={AppComboLogo}
                    alt='App Combo'
                    width={100}
                    height={100}
                    className='w-[180.49px] h-[34px] mr-2'
                />
            </div>
        </header>
    );
}

export default AuthScreenHeader;
