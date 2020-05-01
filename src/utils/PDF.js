import { readAsArrayBuffer } from './asyncReader.js';
import { PDFDocument } from 'pdf-lib';

export async function save(pdfFile, objects) {
  const PDFLib = await window.getScript('PDFLib');
  const download = await window.getScript('download');
  const pdfDoc = await PDFLib.PDFDocument.load(
    await readAsArrayBuffer(pdfFile)
  );
  const pagesProcesses = pdfDoc.getPages().map(async (page, pageIndex) => {
    const pageObjects = objects[pageIndex];
    const embedProcesses = pageObjects.map(async (object) => {
      const { file, x, y, width, height } = object;
      let img;
      if (file.type === 'image/jpeg') {
        img = await pdfDoc.embedJpg(await readAsArrayBuffer(file));
      } else {
        img = await pdfDoc.embedPng(await readAsArrayBuffer(file));
      }
      // 'y' starts from bottom in PDFLib
      return {
        img,
        x,
        y: page.getHeight() - y - height,
        width: width,
        height,
      };
    });
    return Promise.all(embedProcesses).then((embeddables) => {
      embeddables.forEach(({ img, ...rest }) => {
        page.drawImage(img, rest);
      });
    });
  });
  await Promise.all(pagesProcesses);
  const pdfBytes = await pdfDoc.save();
  download(pdfBytes, pdfFile.name, 'application/pdf');
}
