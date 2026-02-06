import * as tf from '@tensorflow/tfjs';
import Papa from 'papaparse';

interface TrainingData {
  features: number[][];
  labels: number[];
}

let trainedModel: tf.LayersModel | null = null;
let isModelTrained = false;

/**
 * Load and parse the CSV dataset
 */
async function loadDataset(): Promise<TrainingData> {
  console.log('📊 Loading anemia dataset...');
  
  const response = await fetch('/anemia_dataset.csv');
  const csvText = await response.text();
  
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const features: number[][] = [];
        const labels: number[] = [];
        
        results.data.forEach((row: any) => {
          if (row.Gender != null && row.Hemoglobin != null) {
            // Features: Gender, Hemoglobin, MCV, MCH, MCHC
            features.push([
              row.Gender,
              row.Hemoglobin,
              row.MCV,
              row.MCH,
              row.MCHC
            ]);
            labels.push(row.Result); // 0 = Normal, 1 = Anemic
          }
        });
        
        console.log(`✅ Loaded ${features.length} samples from dataset`);
        resolve({ features, labels });
      }
    });
  });
}

/**
 * Train Ridge Classifier (implemented as L2-regularized Linear Regression)
 */
export async function trainRidgeClassifier(): Promise<void> {
  if (isModelTrained) {
    console.log('✅ Model already trained');
    return;
  }

  console.log('🤖 Training Ridge Classifier for anemia detection...');
  
  const data = await loadDataset();
  
  // Convert to tensors
  const xs = tf.tensor2d(data.features);
  const ys = tf.tensor2d(data.labels, [data.labels.length, 1]);
  
  // Normalize features (important for Ridge)
  const { mean, variance } = tf.moments(xs, 0);
  const xsNormalized = xs.sub(mean).div(variance.sqrt().add(1e-7));
  
  // Create Ridge Classifier model (Linear model with L2 regularization)
  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        inputShape: [5], // Gender, Hb, MCV, MCH, MCHC
        units: 1,
        activation: 'sigmoid',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.01 }) // Ridge regularization
      })
    ]
  });
  
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy']
  });
  
  // Train the model
  await model.fit(xsNormalized, ys, {
    epochs: 100,
    batchSize: 32,
    validationSplit: 0.2,
    verbose: 0,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (epoch % 20 === 0) {
          console.log(`Epoch ${epoch}: loss=${logs?.loss.toFixed(4)}, acc=${logs?.acc.toFixed(4)}`);
        }
      }
    }
  });
  
  // Save normalization parameters for prediction
  (model as any).normalizationMean = await mean.array();
  (model as any).normalizationStd = await variance.sqrt().add(1e-7).array();
  
  trainedModel = model;
  isModelTrained = true;
  
  // Cleanup tensors
  xs.dispose();
  ys.dispose();
  xsNormalized.dispose();
  mean.dispose();
  variance.dispose();
  
  console.log('✅ Ridge Classifier trained successfully!');
}

/**
 * Predict anemia risk using trained ML model
 */
export async function predictAnemiaWithML(
  gender: number, // 0 = Female, 1 = Male
  hemoglobin: number,
  mcv: number,
  mch: number,
  mchc: number
): Promise<{ prediction: number; confidence: number; riskLevel: string }> {
  
  if (!isModelTrained || !trainedModel) {
    console.warn('⚠️ Model not trained yet, training now...');
    await trainRidgeClassifier();
  }
  
  // Prepare input
  const input = tf.tensor2d([[gender, hemoglobin, mcv, mch, mchc]]);
  
  // Normalize using saved parameters
  const mean = (trainedModel as any).normalizationMean;
  const std = (trainedModel as any).normalizationStd;
  const meanTensor = tf.tensor1d(mean);
  const stdTensor = tf.tensor1d(std);
  
  const inputNormalized = input.sub(meanTensor).div(stdTensor);
  
  // Predict
  const predictionTensor = trainedModel!.predict(inputNormalized) as tf.Tensor;
  const predictionValue = (await predictionTensor.data())[0];
  
  // Cleanup
  input.dispose();
  inputNormalized.dispose();
  predictionTensor.dispose();
  meanTensor.dispose();
  stdTensor.dispose();
  
  // Interpret results
  const confidence = Math.abs(predictionValue - 0.5) * 2; // 0-1 scale
  const prediction = predictionValue > 0.5 ? 1 : 0; // 1 = Anemic, 0 = Normal
  
  let riskLevel: string;
  if (predictionValue < 0.3) riskLevel = 'LOW';
  else if (predictionValue < 0.6) riskLevel = 'MODERATE';
  else riskLevel = 'HIGH';
  
  console.log('🔮 ML Prediction:', {
    prediction: prediction === 1 ? 'ANEMIC' : 'NORMAL',
    rawScore: predictionValue.toFixed(4),
    confidence: (confidence * 100).toFixed(1) + '%',
    riskLevel
  });
  
  return {
    prediction,
    confidence,
    riskLevel
  };
}

/**
 * Get model training status
 */
export function isMLModelReady(): boolean {
  return isModelTrained;
}
