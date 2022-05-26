const md = new markdownit({html:true})
const csv = `
ID,Prompt,Type,Variable,Choice 0 (Default),Choice 1,Choice 2,Choice 3,Choice 4
Begin,"MURICAN TRAILS _Version
An APUSH project by Vritti, Yingjia, Xing, and Andre",,,Role,,,,
Role,"Many kinds of people have done a road trip across America.
You may:
1. Be a middling history student wanting to escape your school
2. ~~Be a recent graduate ready to gamble~~ AGE RESTRICTED
3. ~~Be but a humble public school teacher~~ AGE RESTRICTED
4. ~~Be a baby~~ AGE RESTRICTED",MC,MainCharacter,,Vritti,,,
Vritti,"What is the nickname of the first leader?
Vritti the",SA,Vritti,Yingjia,,,,
Yingjia,"What is the nickname of the second in command?
Yingjia the",SA,Yingjia,Xing,,,,
Xing,"What is the nickname of the third wheel?
Xing the",SA,Xing,Andre,,,,
Andre,"What is the nickname of the fourth student?
Andre the",SA,Andre,Buy0,,,,
Buy0,"Before leaving Arcadia you should buy equipment and supplies. You have $_Money in cash, but you don't have to spend it all now.",,,Buy1,,,,
Buy1,You can buy whatever you need at Paul's Lost and Found.,,,Buy2,,,,
Buy2,"Hello, I'm Paul. So you're going across America! I can fix you up with what you need:",,,Buy3,,,,
Buy3,"Paul's Lost and Found
1. Water bottle: $5.00
2. Nathan's food: $25.00
3. Keys to the schoolbus: $99.00",PURCHASE,,Steal0,$5,$25,$99,
Steal0,"You spot a schoolbus sitting on Campus Drive.
1. Try your keys on the schoolbus.
2. Give Vritti the _Vritti your keys to try on the schoolbus.",MC,,,Steal1,Steal1,,
Steal1,"The keys work!
1. Steal the schoolbus
2. Not not steal the schoolbus",MC,,,Depart,Depart,,
Depart,Unfinished,,,,,,,
`

const data = Object.fromEntries(Papa.parse(csv).data
.map(([id,...rest])=>[id,rest]))

const image = document.querySelector('img')
const output = document.querySelector('output')
const endings = {
  'MC': '\n<I>',
  'SA': ' <I>',
  '': '\n <button>PRESS SPACE TO CONTINUE</button>',
  'PURCHASE': '\n <button>PRESS SPACE TO CONTINUE</button>'
}
const variables = {
  Version: '2022.05.26.1',
  Money: 1600,
}
let input
let id = 'Begin'
let prompt, type, variable, choices

function start(){
  [prompt, type, variable, ...choices] = data[id]
  console.log(id,data[id],choices)
  //image.src = 'media/'+id+'.png'
  prompt += endings[type]
  write(render(prompt))
}
function clickListener(){
  switch(type){
    case '':
      id = choices[0]
      start()
      break
    case 'PURCHASE':
      id = choices[0]
      start()
      break
  }
}
function enterListener({key}){
  if(key != 'Enter') return
  if(variable) variables[variable] = input.value
  const num = parseInt(input.value)
  switch(type){
    case 'MC':
      if(choices[num]){
        id = choices[num]
        start()
      } else{
        write(render('INVALID OPTION. PICK ANOTHER.\n'+prompt))
      }
      break
    case 'SA':
      id = choices[0]
      start()
      break
  }

}
function render(content){
  return md.render(
    content
    .replaceAll('\n','\n\n')
    .replaceAll('<I>','<input placeholder="...">')
    .replaceAll(/_(\w+)/g, (_,key) => variables[key] )
  )
}
function write(content, upTo = 0){
  output.innerHTML = content.slice(0, upTo)
  if(upTo < content.length) setTimeout(write, 3, content, upTo+1)
  else {
    input = document.querySelector('input')
    if(input) {
      input.focus()
      input.addEventListener('keydown',enterListener)
    } else {
      button = document.querySelector('button')
      button.focus()
      button.addEventListener('click',clickListener)
    }
  }
}

start()
