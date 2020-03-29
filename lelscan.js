const jsdom = require('jsdom')
const site = 'LelScan'
const { JSDOM } = jsdom;
//const download = require('image-downloader');
const fs = require('fs');
const Path  = require('path')
const url = 'http://lelscanv.com';
const mangas = {
    'one-piece':{
        name : 'One Piece',
        path: '/scan-one-piece',
        pagePath : '/one-piece'
    },
    'dr-stone':{
        name: 'Dr Stone',
        path: '/scan-dr-stone',
        pagePath: '/dr-stone'
    },
    'the-seven-deadly-sins':{
        name: 'The Seven Deadly Sins',
        path: '/scan-the-seven-deadly-sins',
        pagePath: '/the-seven-deadly-sins'
    }
}

const Axios = require('axios')

async function downloadImage (manga_index,chapter,page,d) { 
  
  const Url = `${url+'/mangas'+mangas[manga_index].pagePath}/${chapter}/${page<10 ? '0'+page : page}.jpg`
  const path = `${d}/page-${page<10 ? '0'+page : page}.jpg`
  

  return new Promise(async (resolve, reject) => {
    const writer = fs.createWriteStream(path)
    let response
    try {
        response = await Axios({
            url:Url,
            method: 'GET',
            responseType: 'stream'
      })
    } catch(e) {
        reject(e)
    }

    response.data.pipe(writer)
    
    writer.on('finish', resolve)
    writer.on('error', reject)
    setTimeout(()=> {
        writer.destroy(new Error('Impossible to download the page '+(page+1)+' Please check your Internet Connection'))
    },30000)
  })
}

async function chapterIsAvailable(manga_index,chap,d) {


        const dom = d || await JSDOM.fromURL('http://lelscanv.com'+mangas[manga_index].path+'/'+chap,{
            includeNodeLocations: true
        })
   


    const domChap = dom.window.document.querySelectorAll("#header-image h2 div a span")[2].innerHTML
    
    const bool = chap == domChap


    return bool
}


async function downloadChapter(manga_index,chap, pathDownload) {
    const tmp = {source: site, chapter:chap}
    const dom = await JSDOM.fromURL('http://lelscanv.com'+mangas[manga_index].path+'/'+chap,{
        includeNodeLocations: true
    })

    const thatDir = Path.join(pathDownload)
    try {
        if(!(await chapterIsAvailable(manga_index,chap,dom))) {
            throw new Error(`The chapter ${chap} of ${mangas[0].name} look not available on ${this.site}. Please visite to check it ${this.url}`)
        }
    } catch(e) {
        this.emit('chapter-is-available-error', e)
        throw e
    }
    const nbPages = Array.from(dom.window.document.querySelectorAll('#navigation a')).map(e=> e.innerHTML).filter(e => parseInt(e)>0).length;
    this.emit('number-of-page', nbPages)

    let i
    for (i = 0;i<nbPages;i++) {
        try {
            this.emit('page-download-started',{ ...tmp,page: i+1, nbPages, path: Path.join(thatDir) })
            await downloadImage(manga_index,chap,i,thatDir)
            this.emit('page-download-finished',{ ...tmp,page: i+1, nbPages, path: Path.join(thatDir) })
        } catch(error) {
            this.emit('page-download-error',{ error, page: i+1 , ...tmp, path: Path.join(thatDir)})
            throw error
        }
    }
    
    return `${thatDir}`
}

async function getLastChapter(manga_index) {
    
    try {
        const dom = await JSDOM.fromURL('http://lelscanv.com/lecture-en-ligne-'+mangas[manga_index].pagePath.slice(1),{
            includeNodeLocations: true
        })
        return parseInt(dom.window.document.querySelectorAll("#header-image h2 div a span")[2].innerHTML)
    } catch(e) {
        throw e
    }
}
module.exports.mangas = mangas
module.exports.url = url
module.exports.downloadChapter = downloadChapter
module.exports.getLastChapter = getLastChapter
module.exports.chapterIsAvailable = chapterIsAvailable
module.exports.site = site
