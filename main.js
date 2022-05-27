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
  '': '\n|PRESS SPACE TO CONTINUE|',
  'PURCHASE': '\nYou have $_Money.\nBuy an item: <I>\n|PRESS SPACE TO EXIT|'
}

const v = {
  Version: '2022.05.26.1',
  Money: 1600,
  Items: {}
}

const fontSize = 18
const fontWidth = 17
const fontHeight = 18

const input = document.querySelector('input')
input.addEventListener('blur',input.focus)

let id, prompt, type, music, variable, choices

const format = string => string
    .replaceAll('\n','\n\n')
    .replaceAll('<I>','|            |')
    .replaceAll(/_(\w+)/g, (_,key) => v[key] )
    .replaceAll(/(?![^\n]{1,57}$)([^\n]{1,57})\s/g, '$1\n')

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
  [prompt, type, music, variable, ...choices] = data[id]
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

  const fontFace = new FontFace('pressstart', 'url(media/pressstart.ttf)');
  const font = await fontFace.load()
  document.fonts.add(font)

  await initCanvas()
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
  if(key == ' '){
    switch(type){
      case 'PURCHASE':
      case '':
        clickListener()
        return
    }
  }

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

  let x = 0
  let y = 20 
  let text = format(content)
  let style = {
    italic: false,
    bold: false,
    underline: false,
    strikethrough: false,
  }
  let _id = id
  for(let i = 0; i<text.length; i++){
    setTimeout(()=>{
      if(_id != id) return
      let char = text[i]
      switch(char){
        case '\n':
          x = 0
          y += 30
          break
        case '~':
          style.strikethrough ^= 1
          break
        case '|':
          style.underline ^= 1
          break
        case '*':
          style.italic ^= 1
          break
        default:
          x += fontWidth 

          ctx.font = `${fontSize}px pressstart ${'bold'.repeat(style.bold)}`

          ctx.fillStyle = 'black'
          ctx.strokeStyle = 'black'
          ctx.lineWidth = 2
          ctx.fillText(char,x+4,y+4)
          ctx.strokeText(char,x,y)
          if(style.strikethrough) ctx.fillRect(x+4,y+4+fontHeight/2,fontWidth,3)
          if(style.underline) ctx.fillRect(x+4,y+4+fontHeight,fontWidth,3)

          ctx.fillStyle = 'white'
          ctx.fillText(char,x,y)
          if(style.strikethrough) ctx.fillRect(x,y+fontHeight/2,fontWidth,3)
          if(style.underline) ctx.fillRect(x,y+fontHeight,fontWidth,3)

          render()
        }
    },i*20)
  }

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
