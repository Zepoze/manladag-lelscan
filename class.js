const lelscan = require('./lelscan')

module.exports = (s) => {
    const lelscan = require('./lelscan')
    class lelscanSource extends s{}
    lelscanSource.site = lelscan.site
    lelscanSource.url = lelscan.url
    lelscanSource.mangas = lelscan.mangas
    lelscanSource._downloadChapter = lelscan.downloadChapter
    lelscanSource._getLastChapter = lelscan.getLastChapter
    lelscanSource._chapterIsAvailable = lelscan.chapterIsAvailable
    return lelscanSource
}