import Project from "../models/Project.js";
import { getR2Client } from "../config/r2.js";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const uploadToR2 = async (file) => {
  const r2 = getR2Client();
  console.log("Uploading to R2...", file.originalname);
  const fileName = `${crypto.randomBytes(16).toString("hex")}-${file.originalname}`;
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET?.trim(),
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
    await r2.send(command);
    console.log("R2 upload success:", fileName);
  } catch (err) {
    console.error("R2 upload failed:", err);
    throw new Error(`R2 Upload Error: ${err.message}`);
  }
  
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
  return { fileName, publicUrl };
};

const deleteFromR2 = async (fileName) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET?.trim(),
    Key: fileName,
  });
  await r2.send(command);
};

export const createProject = async (data, file) => {
  console.log("Creating project with data:", data);
  let imageUrl = data.imageUrl;
  if (file) {
    const uploadResult = await uploadToR2(file);
    imageUrl = uploadResult.publicUrl;
  }

  try {
    let techStack = [];
    if (Array.isArray(data.techStack)) {
      techStack = data.techStack;
    } else if (typeof data.techStack === 'string' && data.techStack.trim() !== '') {
      try {
        techStack = JSON.parse(data.techStack);
      } catch (e) {
        console.error("Failed to parse techStack string:", data.techStack);
        techStack = [];
      }
    }

    const project = await Project.create({
      title: data.title || "Untitled Project",
      description: data.description || "",
      techStack: Array.isArray(techStack) ? techStack.map(t => typeof t === 'object' ? t.name : t) : [],
      githubLink: data.githubLink || null,
      liveLink: data.liveLink || null,
      imageUrl: imageUrl || null,
    });
    console.log("Project created in DB:", project._id);
    return project;
  } catch (err) {
    console.error("DB Project creation failed:", err);
    throw new Error(`DB Error: ${err.message}`);
  }
};

export const getAllProjects = async () => {
  try {
    return await Project.find().sort({ createdAt: -1 });
  } catch (err) {
    console.error("DB Fetch Projects failed:", err);
    throw new Error(`DB Fetch Error: ${err.message}`);
  }
};

export const updateProject = async (id, data, file) => {
  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");

  let imageUrl = project.imageUrl;
  if (file) {
    if (project.imageUrl) {
      const oldFileName = project.imageUrl.split("/").pop();
      try {
        await deleteFromR2(oldFileName);
      } catch (err) {
        console.error("Failed to delete old image:", err);
      }
    }
    const uploadResult = await uploadToR2(file);
    imageUrl = uploadResult.publicUrl;
  }

  let techStack = [];
  if (Array.isArray(data.techStack)) {
    techStack = data.techStack;
  } else if (typeof data.techStack === 'string' && data.techStack.trim() !== '') {
    try {
      techStack = JSON.parse(data.techStack);
    } catch (e) {
      techStack = [];
    }
  }

  return await Project.findByIdAndUpdate(
    id,
    {
      title: data.title,
      description: data.description,
      techStack: Array.isArray(techStack) ? techStack.map(t => typeof t === 'object' ? t.name : t) : [],
      githubLink: data.githubLink,
      liveLink: data.liveLink,
      imageUrl,
    },
    { new: true }
  );
};

export const deleteProject = async (id) => {
  const project = await Project.findById(id);
  if (project?.imageUrl) {
    const fileName = project.imageUrl.split("/").pop();
    try {
      await deleteFromR2(fileName);
    } catch (err) {
      console.error("Failed to delete image from R2:", err);
    }
  }
  return await Project.findByIdAndDelete(id);
};
