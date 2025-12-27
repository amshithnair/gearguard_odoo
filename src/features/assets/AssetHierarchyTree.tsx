import React, { useState } from 'react';
import { useDbQuery } from '../../hooks/use-db-query';
import { ChevronRight, ChevronDown, Factory, MapPin, Box, Settings } from 'lucide-react';

interface HierarchyNode {
    id: string;
    name: string;
    level_type: 'Site' | 'Area' | 'Work Center';
    parent_id: string | null;
    children?: HierarchyNode[]; // Calculated in JS
    equipment?: any[];
}

const TreeNode = ({ node, level }: { node: HierarchyNode, level: number }) => {
    const [expanded, setExpanded] = useState(true);

    const getIcon = (type: string) => {
        switch (type) {
            case 'Site': return <Factory className="w-4 h-4 text-purple-600" />;
            case 'Area': return <MapPin className="w-4 h-4 text-orange-500" />;
            case 'Work Center': return <Box className="w-4 h-4 text-blue-500" />;
            default: return <Settings className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div style={{ marginLeft: `${level * 12}px` }}>
            <div
                className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                {node.children && node.children.length > 0 ? (
                    expanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />
                ) : <span className="w-3" />}

                {getIcon(node.level_type)}
                <span className={`text-sm ${level === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {node.name}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {node.level_type}
                </span>
            </div>

            {expanded && (
                <div className="border-l border-gray-100 ml-3">
                    {/* Render Children (Sub-locations) */}
                    {node.children?.map(child => (
                        <TreeNode key={child.id} node={child} level={level + 1} />
                    ))}

                    {/* Render Equipment at this location */}
                    {node.equipment?.map((eq: any) => (
                        <div key={eq.id} className="flex items-center gap-2 py-1.5 px-2 ml-4 hover:bg-gray-50 rounded-md group">
                            <Settings className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">{eq.name}</span>

                            {/* Status Pill */}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${eq.status === 'Active' ? 'bg-green-100 text-green-700' :
                                    eq.status === 'Under Maintenance' ? 'bg-amber-100 text-amber-700' :
                                        'bg-gray-100 text-gray-500'
                                }`}>
                                {eq.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const AssetHierarchyTree = () => {
    // 1. Fetch Hierarchy Nodes
    const { data: nodes } = useDbQuery<HierarchyNode>('SELECT * FROM asset_hierarchy ORDER BY level_type');
    // 2. Fetch Equipment to map to nodes
    const { data: equipment } = useDbQuery('SELECT id, name, status, asset_hierarchy_id FROM equipment');

    // 3. Build the Tree Structure
    const buildTree = (allItems: HierarchyNode[]) => {
        const rootItems: HierarchyNode[] = [];
        const lookup: Record<string, HierarchyNode> = {};

        allItems.forEach(item => {
            lookup[item.id] = { ...item, children: [], equipment: [] };
        });

        // Add equipment to nodes
        equipment.forEach((eq: any) => {
            if (eq.asset_hierarchy_id && lookup[eq.asset_hierarchy_id]) {
                lookup[eq.asset_hierarchy_id].equipment?.push(eq);
            }
        });

        allItems.forEach(item => {
            if (item.parent_id) {
                lookup[item.parent_id]?.children?.push(lookup[item.id]);
            } else {
                rootItems.push(lookup[item.id]);
            }
        });

        return rootItems;
    };

    const treeData = buildTree(nodes);

    if (nodes.length === 0) return <div className="p-4 text-sm text-gray-500">Loading Hierarchy...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Factory className="w-4 h-4 text-gray-500" />
                    Plant Hierarchy (ISA-95)
                </h3>
            </div>
            <div className="p-4">
                {treeData.map(node => (
                    <TreeNode key={node.id} node={node} level={0} />
                ))}
            </div>
        </div>
    );
};
