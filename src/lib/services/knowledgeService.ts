import { supabase } from '@/lib/supabase';
import { PLATFORM_KNOWLEDGE_BASE } from '@/lib/mockData';
import { KnowledgeDocument } from '@/types';

export class KnowledgeService {
  /**
   * List all platform-level shared knowledge documents from Supabase.
   * Auto-seeds platform knowledge documents if the table is empty.
   * Throws structured error if database query fails.
   */
  static async listDocuments(): Promise<KnowledgeDocument[]> {
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch platform knowledge documents: ${error.message}`);
    }

    if (data && data.length > 0) {
      return data;
    }

    // Platform-level initialization: seed platform knowledge base into Supabase
    try {
      const { data: seeded, error: seedError } = await supabase
        .from('knowledge_documents')
        .insert(PLATFORM_KNOWLEDGE_BASE)
        .select();

      if (!seedError && seeded && seeded.length > 0) {
        return seeded;
      }
    } catch {
      // ignore seed error
    }

    return PLATFORM_KNOWLEDGE_BASE;
  }

  /**
   * Search MCA guidance, Companies Act 2013 rules, and circulars.
   */
  static async searchKnowledge(query: string): Promise<{
    results: KnowledgeDocument[];
    answer_context: string[];
    sources: { title: string; section?: string; form?: string }[];
  }> {
    const q = (query || '').toLowerCase().trim();
    const docs = await this.listDocuments();

    if (!q) {
      return {
        results: docs,
        answer_context: docs.map(d => d.summary),
        sources: docs.map(d => ({
          title: d.title,
          section: d.act_section,
          form: d.relevant_forms?.[0]
        }))
      };
    }

    const filtered = docs.filter(
      doc =>
        doc.title.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q) ||
        doc.official_guidance.toLowerCase().includes(q) ||
        (doc.penalties && doc.penalties.toLowerCase().includes(q)) ||
        doc.relevant_forms?.some(f => f.toLowerCase().includes(q)) ||
        (doc.act_section && doc.act_section.toLowerCase().includes(q))
    );

    const matchResults = filtered.length > 0 ? filtered : docs.slice(0, 2);

    return {
      results: matchResults,
      answer_context: matchResults.map(
        d => `[${d.title} - ${d.act_section || 'Companies Act'}]: ${d.official_guidance}`
      ),
      sources: matchResults.map(d => ({
        title: d.title,
        section: d.act_section,
        form: d.relevant_forms?.[0]
      }))
    };
  }
}
