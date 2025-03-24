import { LoremIpsum } from 'lorem-ipsum';

class CaptioningService {
  constructor() {
    this.lorem = new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4
      },
      wordsPerSentence: {
        max: 16,
        min: 4
      }
    });
  }

  generateCaption() {
    return this.lorem.generateSentences(1);
  }
}

export const captioningService = new CaptioningService(); 