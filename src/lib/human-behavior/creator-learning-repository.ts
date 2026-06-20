import { createServerSupabaseClient }
  from '@/lib/supabase-server';

import { CreatorLearning }
  from '@/types/creator-learning';

export async function saveLearning(
  creatorId: string,
  learning: CreatorLearning
) {
  const supabase =
    await createServerSupabaseClient();

  const { data, error } =
    await supabase
      .from('creator_learnings')
      .insert({
        id: learning.id,

        creator_id: creatorId,

        statement: learning.statement,

        hypothesis:
          learning.origin.hypothesis,

        constraint_type:
          learning.origin.constraintType,

        experiment_id:
          learning.origin.experimentId,

        confidence:
          learning.confidence,

        status:
          learning.status,

        supporting_evidence_count:
          learning.supportingEvidenceCount,

        contradicting_evidence_count:
          learning.contradictingEvidenceCount
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return mapRowToLearning(
    data
  );
}

export async function updateLearning(
  learning: CreatorLearning
) {
  const supabase =
    await createServerSupabaseClient();

  const { data, error } =
    await supabase
      .from('creator_learnings')
      .update({
        statement:
          learning.statement,

        hypothesis:
          learning.origin.hypothesis,

        constraint_type:
          learning.origin.constraintType,

        experiment_id:
          learning.origin.experimentId,

        confidence:
          learning.confidence,

        status:
          learning.status,

        supporting_evidence_count:
          learning.supportingEvidenceCount,

        contradicting_evidence_count:
          learning.contradictingEvidenceCount,

        last_updated:
          learning.lastUpdated
      })
      .eq('id', learning.id)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return mapRowToLearning(
    data
  );
}

function mapRowToLearning(
  row: any
): CreatorLearning {
  return {
    id: row.id,

    statement: row.statement,

    origin: {
      hypothesis: row.hypothesis,

      constraintType:
        row.constraint_type,

      experimentId:
        row.experiment_id
    },

    confidence: row.confidence,

    status: row.status,

    supportingEvidenceCount:
      row.supporting_evidence_count,

    contradictingEvidenceCount:
      row.contradicting_evidence_count,

    createdAt:
      row.created_at,

    lastUpdated:
      row.last_updated
  };
}

export async function getLearningsByCreator(
  creatorId: string
): Promise<CreatorLearning[]> {

  const supabase =
    await createServerSupabaseClient();

  const { data, error } =
    await supabase
      .from('creator_learnings')
      .select('*')
      .eq('creator_id', creatorId);

  if (error) {
    throw error;
  }

  return (data ?? []).map(
    mapRowToLearning
  );
}