import React from 'react'

interface GeneratorTargetsChooserProps {
  onChoose: (ev: { target: { value: string } }) => any
  value: string
}

const GeneratorTargetsChooser: React.SFC<GeneratorTargetsChooserProps> = (props) => {
  return (
    <select onChange={props.onChoose} value={props.value}>
      <option value="react.InlineStyles">React Inline Styles</option>
      <option value="react.StyledJSX">React StyledJSX</option>
      <option value="react.JSS">React JSS</option>
      <option value="vue-ast">VueAST</option>
      {/* <option value='angular'>Angular</option> */}
    </select>
  )
}

export { GeneratorTargetsChooser }
