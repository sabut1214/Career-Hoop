export async function UploadFile({ file }) {
  const url = URL.createObjectURL(file)
  return { file_url: url }
}

export async function ExtractDataFromUploadedFile({ file_url, json_schema }) {
  // Placeholder: return a minimal plausible structure
  return {
    status: "success",
    output: {
      grade_10_percentage: 80,
      grade_12_percentage: 82,
      stream: "science",
      subjects: [],
      subject_grades: {},
    },
  }
}

export async function InvokeLLM({ prompt, response_json_schema }) {
  // Placeholder AI call: returns an empty recommendations list
  return { recommendations: [] }
}
