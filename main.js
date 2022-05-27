const md = new markdownit({html:true})
const image = new Image()
const data = 
  Object.fromEntries(
    Papa.parse(
      document.querySelector('div').innerHTML
    ).data
.map(([id,...rest])=>[id,rest]))

const output = document.querySelector('output')
const endings = {
  'MC': '\n<I>',
  'SA': ' <I>',
  '': '\n <button>PRESS SPACE TO CONTINUE</button>',
  'PURCHASE': '\nYou have $_Money.\nBuy an item: <I>\n<button>PRESS SPACE TO EXIT</button>'
}
const variables = {
  Version: '2022.05.26.1',
  Money: 1600,
  Items: {}
}
let input
let id, prompt, type, variable, choices

function start(_id){
  id = _id;
  ctx.clearRect(0,0,w,h);
  [prompt, type, variable, ...choices] = data[id]
  console.log(id,data[id],choices)
  image.src = `media/${id}.png`
  image.addEventListener('load',()=>{
    ctx.drawImage(image,0,0,w,h)
    setTimeout(render,10)
  })
  prompt += endings[type]
  write((prompt))

}
function clickListener(){
  switch(type){
    case '':
      start(choices[0])
      break
    case 'PURCHASE':
      start(choices[0])
      break
  }
}
function enterListener({key}){
  if(type == 'PURCHASE' && key == ' ') return clickListener()
  if(key != 'Enter') return
  if(variable) variables[variable] = input.value
  const num = parseInt(input.value)
  switch(type){
    case 'MC':
      if(choices[num]){
        start(choices[num])
      } else{
        write(('INVALID OPTION. PICK ANOTHER.\n'+prompt))
      }
      break
    case 'SA':
      start(choices[0])
      break
    case 'PURCHASE':
      if(variables.Money >= choices[num]) {
        variables.Money -= choices[num]
        write(("YOU BOUGHT ONE ITEM.\n"+prompt))
      } else {
        write(("YOU DON'T HAVE THE MONEY FOR THAT. PICK ANOTHER OR LEAVE MY STORE.\n"+prompt))
      }

      
      //if(item in variables.items) variables.items[item]++
      //else variables.items[item] = 0
  }

}

function format(content){
  return (
    content
    .replaceAll('\n','\n\n')
    .replaceAll('<I>','<input placeholder="...">')
    .replaceAll(/_(\w+)/g, (_,key) => variables[key] )
    .replaceAll(/(?![^\n]{1,50}$)([^\n]{1,50})\s/g, '$1\n')
  )
}
let w = 1000
let h = 800
const canvas = document.querySelector('canvas')
let glcanvas = fx.canvas()
canvas.parentNode.insertBefore(glcanvas,canvas)
canvas.style.display = 'none'
const ctx = canvas.getContext('2d')
ctx.translate(w/10,h/10)
ctx.scale(4/5,4/5)
ctx.textBaseline = 'top'
function write(content){
  ctx.font = '20px "Press Start 2P"';

  let x = 0
  let y = 20 
  let text = format(content)
  for(let i = 0; i<text.length; i++){
    let char = text[i]
    if(char == '\n'){
      x = 0
      y += 30
    } else {
      x += 20
      
      setTimeout((_c,_x,_y)=>{
        ctx.fillStyle = 'black'
        ctx.fillText(_c,_x+4,_y+4)
        ctx.fillStyle = 'white'
        ctx.fillText(_c,_x,_y)
      },i*10,char,x,y)
      if(i%5==0) setTimeout(render, i*10)
    }
  }

  button = document.querySelector('button')
  if(button) button.focus()

  input = document.querySelector('input')
  if(input) input.focus()

}

function render(){
    let texture = glcanvas.texture(canvas);
    texture.loadContentsOf(canvas);

      // Apply WebGL magic
    glcanvas.draw(texture)
        .bulgePinch(w/2, h/2, w*2/3, 0.15)
        .vignette(0.25, 0.74)
        .lensBlur(0.2,1,0)
        .brightnessContrast(0.1,0.1)
        .update();
}
document.addEventListener('keydown',enterListener)
document.addEventListener('click',clickListener)
start('Begin')

