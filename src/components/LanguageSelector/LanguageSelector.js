import React from 'react'
import { useTranslation } from 'react-i18next'

import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import MenuList from '@material-ui/core/MenuList';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation()

//   const changeLanguage = (event) => {
//     i18n.changeLanguage(event.target.value)
//   }

const changeLanguage = (string) => {
    i18n.changeLanguage(string)
  }

  return (
    // <div onChange={changeLanguage}>
    //   <input type="radio" value="en" name="language" defaultChecked /> English
    //   <input type="radio" value="zh-hk" name="language" /> Traditional Chinese
	// </div>
		<MenuList>
			<MenuItem
				onClick={(e) => {
					changeLanguage("en");
				}}
			>
				{t('LanguageSelection.lang.eng')}
			</MenuItem>
			<MenuItem
				onClick={(e) => {
					changeLanguage("zh-hk");
				}}
			>
				{t('LanguageSelection.lang.zhHK')}
			</MenuItem>
		</MenuList>
  )
}

export default LanguageSelector

