// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import path from 'path';

const createPdfBinary = (docDefinition: TDocumentDefinitions, cb: (data: Buffer) => void, errorCb: (error: Error) => void) => {
	const fontDescriptors = {
		Roboto: {
			normal: path.join(process.cwd(), 'public/fonts/Roboto/Roboto-Regular.ttf'),
			bold: path.join(process.cwd(), 'public/fonts/Roboto/Roboto-Medium.ttf'),
			italics: path.join(process.cwd(), 'public/fonts/Roboto/Roboto-Italic.ttf'),
			bolditalics: path.join(process.cwd(), 'public/fonts/Roboto/Roboto-MediumItalic.ttf')
		}
	};

	const printer = new PdfPrinter(fontDescriptors);
	const doc = printer.createPdfKitDocument(docDefinition);

	const chunks: Buffer[] = [];
	let result: Buffer;

	doc.on('data', (chunk: Buffer) => {
		chunks.push(chunk);
	});
	doc.on('end', () => {
		result = Buffer.concat(chunks);
		cb(result);
	});
	doc.on('error', (error) => {
		console.error(`ERROR=${error}`);
		errorCb(error);
	});
	doc.end();
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | string>
) {
  console.log(`=>=>=>=>=> pdf/generate handler`);
  if (req.method !== 'POST') {
    res.status(405).send(`ERROR=405 Method Not Allowed`);
		return;
  }

  createPdfBinary(req.body, (data: Buffer) => {
    res.setHeader('Content-Type', 'application/pdf');
    res.send(data);
  }, (error: Error) => {
		res.send(`ERROR=${error}`);
	});
}
