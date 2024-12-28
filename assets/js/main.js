import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js"

const socket = io()

const popsicleMinMax = {
    x: {
        min: 0.2 * window.innerWidth,
        max: 0.8 * window.innerWidth
    },
    y: {
        min: 0 * window.innerHeight,
        max: 0.9 * window.innerHeight
    }
}

console.log(popsicleMinMax)

let updateMouse = true

const mouse = {
    x: 0,
    y: 0
}

const popsicleOffset = {
    x: -230,
    y: -250
}

const imageOffset = {
    x: 220,
    y: 20
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

let creatingPopsicle = false
let popsicleImage = null
let popsicleDiv = null

document.addEventListener('keydown', (e)=>{
    if (e.key == "e" && creatingPopsicle == false) {
        creatingPopsicle = true
        document.getElementById('image-url').value = ""
        popsicleDiv = document.createElement('div')
        popsicleDiv.classList.add('popsicle-div')
        popsicleImage = document.createElement('img')
        popsicleImage.src = "https://www.digitalscrapbook.com/sites/default/files/styles/456_scale/public/s3fs-user-content/graphic-image/user-2/node-119364/popsicle-stick-02-graphic-brown.png"
        popsicleImage.classList.add('popsicle')
        function updatePopsicle() {
            popsicleImage.style.left = `${clamp(mouse.x, popsicleMinMax.x.min, popsicleMinMax.x.max) + popsicleOffset.x}px`
            popsicleImage.style.top = `${clamp(mouse.y, popsicleMinMax.y.min, popsicleMinMax.y.max) + popsicleOffset.y}px`
            
            if (creatingPopsicle) {
                requestAnimationFrame(updatePopsicle)
            }
        }

        requestAnimationFrame(updatePopsicle)
        document.body.appendChild(popsicleDiv)
        popsicleDiv.appendChild(popsicleImage)
    } else if (e.key == "e" && creatingPopsicle) {
        popsicleImage.remove()
        popsicleDiv.remove()
        popsicleDiv = null
        popsicleImage = null
        creatingPopsicle = false
    }
})

document.addEventListener('mousedown', async ()=>{
    if (creatingPopsicle) {
        updateMouse = false
        let gettingURL = true
        document.getElementById('image-form').showModal()
        document.getElementById('post').addEventListener('click', ()=>{
            gettingURL = false
        })
        while (gettingURL) {
            await new Promise((res)=>{
                setTimeout(res);
            })
        }

        const x = mouse.x
        const y = mouse.y

        document.getElementById('image-form').close()
        const url = document.getElementById('image-url').value
        console.log(url)
        const image = new Image()
        image.src = url
        image.style.left = `${clamp(x, popsicleMinMax.x.min, popsicleMinMax.x.max) + popsicleOffset.x + imageOffset.x}px`
        image.style.top = `${clamp(y, popsicleMinMax.y.min, popsicleMinMax.y.max) + popsicleOffset.y + imageOffset.y}px`
        image.classList.add('image')
        creatingPopsicle = false
        image.addEventListener('error', (err)=>{
            popsicleImage.remove()
            popsicleDiv.remove()
            popsicleDiv = null
            popsicleImage = null
            updateMouse = true
            alert("Image failed to load")
        })

        image.addEventListener('load', ()=>{
            socket.emit('image', {
                url,
                x,
                y
            })

            popsicleDiv.appendChild(image)
            popsicleImage = null
            popsicleDiv = null
            updateMouse = true
        })
    }
})

socket.on('image', (data)=>{
    const _popsicleDiv = document.createElement('div')
    _popsicleDiv.classList.add('popsicle-div')
    const _popsicleImage = document.createElement('img')
    _popsicleImage.src = "https://www.digitalscrapbook.com/sites/default/files/styles/456_scale/public/s3fs-user-content/graphic-image/user-2/node-119364/popsicle-stick-02-graphic-brown.png"
    _popsicleImage.classList.add('popsicle')
    _popsicleImage.style.left = `${clamp(data.x, popsicleMinMax.x.min, popsicleMinMax.x.max) + popsicleOffset.x}px`
    _popsicleImage.style.top = `${clamp(data.y, popsicleMinMax.y.min, popsicleMinMax.y.max) + popsicleOffset.y}px`

    document.body.appendChild(_popsicleDiv)
    _popsicleDiv.appendChild(_popsicleImage)

    const image = new Image()
    image.src = data.url
    image.style.left = `${clamp(data.x, popsicleMinMax.x.min, popsicleMinMax.x.max) + popsicleOffset.x + imageOffset.x}px`
    image.style.top = `${clamp(data.y, popsicleMinMax.y.min, popsicleMinMax.y.max) + popsicleOffset.y + imageOffset.y}px`
    image.classList.add('image')
    image.addEventListener('load', ()=>{
        _popsicleDiv.appendChild(image)
    })
})

document.addEventListener('mousemove', (e)=>{
    if (updateMouse) {
        mouse.x = e.clientX
        mouse.y = e.clientY
    }
})