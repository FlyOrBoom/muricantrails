const image = new Image()
const data = 
  Object.fromEntries(
    Papa.parse(
      document.querySelector('div').innerHTML
    ).data
.map(([id,...rest])=>[id,rest]))

const endings = {
  'MC': '\n<I>',
  'SA': ' <I>',
  '': '\n <button>PRESS SPACE TO CONTINUE</button>',
  'PURCHASE': '\nYou have $_Money.\nBuy an item: <I>\n<button>PRESS SPACE TO EXIT</button>'
}

const v = {
  Version: '2022.05.26.1',
  Money: 1600,
  Items: {}
}

let input
let id, prompt, type, variable, choices

const format = string => string
    .replaceAll('\n','\n\n')
    .replaceAll('<I>','<input placeholder="...">')
    .replaceAll(/_(\w+)/g, (_,key) => v[key] )
    .replaceAll(/(?![^\n]{1,56}$)([^\n]{1,56})\s/g, '$1\n')

let w = 1000
let h = 800

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
const glcanvas = fx.canvas()

async function initCanvas(){
  canvas.width = w
  canvas.height = h
  document.body.prepend(glcanvas)
  ctx.translate(w/8,h/8)
  ctx.scale(3/4,3/4)
  ctx.textBaseline = 'top'
}

async function show(_id){
  id = _id;
  ctx.clearRect(0,0,w,h)
  ctx.fillStyle = '#000'
  ctx.fillRect(0,0,w,h);
  [prompt, type, variable, ...choices] = data[id]
  console.log(id,data[id],choices)
  image.src = `media/${id}.png`
  image.addEventListener('load',()=>{
    ctx.drawImage(image,0,0,w,h)
    setTimeout(render,10)
  })
  prompt += endings[type]
  write(prompt)
}

async function main(){
  document.addEventListener('keydown',enterListener)
  document.addEventListener('click',clickListener)

  initCanvas()
  show('Begin')
}
main()

async function clickListener(){
  switch(type){
    case '':
      show(choices[0])
      break
    case 'PURCHASE':
      show(choices[0])
      break
  }
}

async function enterListener({key}){
  if(type == 'PURCHASE' && key == ' ') return clickListener()
  if(key != 'Enter') return
  if(variable) v[variable] = input.value
  const num = parseInt(input.value)
  switch(type){
    case 'MC':
      if(choices[num]){
        show(choices[num])
      } else{
        write('INVALID OPTION. PICK ANOTHER.\n'+prompt)
      }
      break
    case 'SA':
      show(choices[0])
      break
    case 'PURCHASE':
      if(v.Money >= choices[num]) {
        v.Money -= choices[num]
        write(("YOU BOUGHT ONE ITEM.\n"+prompt))
      } else {
        write(("YOU DON'T HAVE THE MONEY FOR THAT. PICK ANOTHER OR LEAVE MY STORE.\n"+prompt))
      }

      
      //if(item in v.items) variables.items[item]++
      //else v.items[item] = 0
  }

}

async function write(content){
  ctx.font = '18px pressstart'

  let x = 0
  let y = 20 
  let text = format(content)
  for(let i = 0; i<text.length; i++){
    let char = text[i]
    if(char == '\n'){
      x = 0
      y += 30
    } else {
      x += 18 
      
      setTimeout((_c,_x,_y)=>{
        ctx.fillStyle = 'black'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 2
        ctx.fillText(_c,_x+4,_y+4)
        ctx.strokeText(_c,_x,_y)
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

async function render(){
    let texture = glcanvas.texture(canvas);
    texture.loadContentsOf(canvas);

      // Apply WebGL magic
    glcanvas.draw(texture)
        .bulgePinch(w/2, h/2, w*3/4, 0.25)
        .vignette(0.25, 0.74)
        //.lensBlur(0.2,1,0)
        .brightnessContrast(0.1,0.1)
        .update();
}
