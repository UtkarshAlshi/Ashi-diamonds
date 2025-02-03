const fs = require('fs');
const csvParser = require('csv-parser');

function convertCsvToJson(filePath, outputFilePath) {
    return new Promise((resolve, reject) => {
        const result = [];

        fs.createReadStream(filePath)
            .pipe(
                csvParser({
                    mapHeaders: ({ header }) => header.trim(), // Normalize keys by trimming spaces
                })
            )
            .on('data', (row) => {
                console.log('Raw Row:', row); // Debugging to see the keys and values

                result.push({
                    id: parseInt(row.Id, 10),
                    SpecificationAttributeId: parseInt(row.SpecificationAttributeId, 10),
                    value: row.Name,
                });
            })
            .on('end', () => {
                fs.writeFile(outputFilePath, JSON.stringify(result, null, 2), (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(`JSON has been written to ${outputFilePath}`);
                });
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}


// Example usage:
const filePath = 'attribs.csv'; // Replace with the path to your CSV file
const outputFilePath = 'output.json'; // Output file path

convertCsvToJson(filePath, outputFilePath)
    .then((message) => {
        console.log(message);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
