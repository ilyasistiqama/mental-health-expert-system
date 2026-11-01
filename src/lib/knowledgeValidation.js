// Validate the entire dataset before publishing any rules to the inference engine.
export function validateKnowledgeBase(conditions, symptoms, references, durationOptions) {
    const fail = message => { throw new Error('Basis pengetahuan tidak valid: ' + message); };
    const index = (items, field, label) => {
        if (!Array.isArray(items) || !items.length) fail(label + ' harus berupa daftar yang terisi');
        const result = new Map();
        for (const item of items) {
            if (!item || typeof item[field] !== 'string' || !item[field] || result.has(item[field])) fail(label + ': kode kosong atau duplikat');
            result.set(item[field], item);
        }
        return result;
    };
    const referenceMap = index(references, 'id', 'references');
    const symptomMap = index(symptoms, 'code', 'symptoms');
    const conditionMap = index(conditions, 'code', 'conditions');
    const checkReferences = (ids, label) => {
        if (!Array.isArray(ids) || !ids.length || ids.some(id => !referenceMap.has(id))) fail(label + ': rujukan bukti hilang atau tidak dikenal');
    };
    for (const symptom of symptoms) {
        checkReferences(symptom.references, symptom.code);
        if (!symptom.name || (!symptom.sources && !symptom.question)) fail(symptom.code + ': nama atau pertanyaan kosong');
        if (symptom.sources && symptom.question) fail(symptom.code + ': fakta turunan tidak boleh punya pertanyaan');
        if (symptom.sources && (!Array.isArray(symptom.sources) || !symptom.sources.length || new Set(symptom.sources).size !== symptom.sources.length || symptom.sources.some(code => !symptomMap.has(code) || symptomMap.get(code).sources))) fail(symptom.code + ': sumber fakta turunan tidak valid');
    }
    if (!conditionMap.has('P0')) fail('P0 wajib tersedia');
    for (const condition of conditions) {
        if (!Array.isArray(condition.criteria)) fail(condition.code + ': criteria harus berupa daftar');
        if (!durationOptions.some(option => option.days === condition.minimumDuration)) fail(condition.code + ': ambang durasi tidak didukung');
        checkReferences(condition.references, condition.code);
        if (condition.code !== 'P0') {
            checkReferences(condition.evidenceReferences, condition.code);
            if (!condition.criteria.length) fail(condition.code + ': aturan kosong');
        }
        for (const criterion of condition.criteria) {
            const codes = criterion.symptoms;
            if (!Array.isArray(codes) || !codes.length || new Set(codes).size !== codes.length || codes.some(code => !symptomMap.has(code) || symptomMap.get(code).educationalOnly)) fail(condition.code + ': gejala aturan hilang, duplikat, atau hanya edukasi');
            const minimum = criterion.minimum ?? codes.length;
            if (!Number.isInteger(minimum) || minimum < 1 || minimum > codes.length) fail(condition.code + ': ambang jumlah gejala tidak valid');
            checkReferences(criterion.references, condition.code + ': criteria');
        }
    }
}
