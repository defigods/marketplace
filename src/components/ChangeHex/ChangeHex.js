import React, { useState, useContext } from 'react'
import { withMapContext } from '../../context/MapContext'

const ChangeHex = (props) => {
  const [hex, setHex] = useState('');

  const updateHex = (e) => {
    setHex(e.target.value);  
  }
  
  const changeHex = e => {
      e.preventDefault();
      props.mapProvider.actions.changeHexId(hex)
  }

  return(
    <form onSubmit={changeHex}>
      <input type="text" name="hex" value={hex} onChange={updateHex}/>
      <button>Submit</button>
    </form>
  )
}

export default withMapContext(ChangeHex);