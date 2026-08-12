export default async function parseImageUrl (images = [], type = "media") {
	if (images.length) {
		const res = await uniCloud.getTempFileURL({
		  fileList: images
		})
		return images.map(image => {
		  const file = res.fileList.find(item =>  image.endsWith(item.fileID))
	
		  return {
			src: file ? file.tempFileURL : image,
			source: image
		  }
		})
	} else {
		return []
	}
}