import { dbConnect } from "@/app/utils/db";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!collection) {
    return new NextResponse("Collection parameter is required", { status: 400 });
  }

  await dbConnect();

  try {
    let logs;
    const allCollections = ['akarsh', 'sejal', 'sanchari', 'malvika', 'sneha', 'aditya', 'piyush', 'dhananjay', 'roshini'];

    const getModel = (colName) => {
      if (!allCollections.includes(colName)) {
        throw new Error(`Invalid collection name: ${colName}`);
      }
      return mongoose.models[colName] || mongoose.model(colName, new mongoose.Schema({}, { strict: false }), colName);
    };

    const fetchLogs = async (model) => {
      let allLogs = await model.find().lean();
      return allLogs.filter(log => {
        if (!log.Timestamp) return false;
        const logDate = new Date(log.Timestamp);
        if (startDate && logDate < new Date(startDate)) return false;
        if (endDate && logDate > new Date(endDate + 'T23:59:59.999Z')) return false;
        return true;
      });
    };

    if (collection === 'all') {
      logs = await Promise.all(allCollections.map(async (col) => {
        const model = getModel(col);
        return await fetchLogs(model);
      }));
      logs = logs.flat();
    } else {
      const model = getModel(collection);
      logs = await fetchLogs(model);
    }

    return new NextResponse(JSON.stringify(logs), { status: 200 });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return new NextResponse(`Error fetching logs: ${error.message}`, { status: 500 });
  }
}
