/**
 * Courses service — provides the mobile course catalogue and course details.
 *
 * Expected inputs/outputs: optional course filters or IDs in, active course data out.
 * Supabase target (future): courses table.
 * Status: PLACEHOLDER — not wired to Supabase yet.
 * Wire-up TODO: list active courses and model Manila Golf and Country Club first.
 */
import type { Course } from './courses.types';
import { mobileDataService } from '../mock.service';

/** List bookable courses. Will query active `courses` records for the mobile app. */
export async function listCourses(): Promise<Course[]> {
  return mobileDataService.listCourses();
}

/** Fetch course details. Will query the `courses` table by primary key. */
export async function getCourse(courseId: string): Promise<Course | null> {
  return mobileDataService.getCourse(courseId);
}

