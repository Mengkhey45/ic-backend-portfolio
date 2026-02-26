import * as projectService from "../services/project.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    return successResponse(res, projects, "Projects retrieved successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body, req.file);
    return successResponse(res, project, "Project created successfully", 201);
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectService.updateProject(id, req.body, req.file);
    return successResponse(res, project, "Project updated successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await projectService.deleteProject(id);
    return successResponse(res, null, "Project deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message);
  }
};
