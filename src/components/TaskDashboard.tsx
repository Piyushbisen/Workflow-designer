import React, { useState, useMemo } from 'react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Flag,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  Search,
  Download,
  FileText
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'highest';
  assignee: string;
  reporter: string;
  dueDate: string;
  createdDate: string;
  nodeId: string;
  nodeType: string;
  parentId?: string;
  subtasks: string[];
  comments: number;
  attachments: number;
  storyPoints: number;
  labels: string[];
}

interface Epic {
  id: string;
  name: string;
  description: string;
  color: string;
  progress: number;
  tasks: string[];
}

const TaskDashboard: React.FC = () => {
  const { nodes, edges } = useWorkflow();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEpic, setSelectedEpic] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'hierarchy'>('board');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Auto-generate tasks and epics from workflow nodes
  React.useEffect(() => {
    // Create epics based on connected components
    const connectedComponents = findConnectedComponents();
    const generatedEpics: Epic[] = connectedComponents.map((component, index) => ({
      id: `epic-${index}`,
      name: `Workflow Epic ${index + 1}`,
      description: `Epic containing ${component.length} related tasks`,
      color: ['blue', 'green', 'purple', 'orange', 'red'][index % 5],
      progress: 0,
      tasks: component.map(nodeId => `task-${nodeId}`)
    }));

    // Generate hierarchical tasks from workflow nodes
    const generatedTasks: Task[] = nodes.map((node, index) => {
      const existingTask = tasks.find(t => t.nodeId === node.id);
      if (existingTask) return existingTask;

      // Find parent task based on incoming edges
      const incomingEdges = edges.filter(edge => edge.target === node.id);
      const parentNodeId = incomingEdges.length > 0 ? incomingEdges[0].source : undefined;
      const parentTaskId = parentNodeId ? `task-${parentNodeId}` : undefined;

      // Find subtasks based on outgoing edges
      const outgoingEdges = edges.filter(edge => edge.source === node.id);
      const subtaskIds = outgoingEdges.map(edge => `task-${edge.target}`);

      return {
        id: `task-${node.id}`,
        title: node.data.label || `${node.type} Task`,
        description: `Task generated from ${node.type} node: ${node.data.label || 'Untitled'}`,
        status: index === 0 ? 'in-progress' : 'todo',
        priority: getPriorityFromNodeType(node.type || 'rectangle'),
        assignee: 'Unassigned',
        reporter: 'System',
        dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdDate: new Date().toISOString().split('T')[0],
        nodeId: node.id,
        nodeType: node.type || 'rectangle',
        parentId: parentTaskId,
        subtasks: subtaskIds,
        comments: Math.floor(Math.random() * 5),
        attachments: Math.floor(Math.random() * 3),
        storyPoints: getStoryPointsFromNodeType(node.type || 'rectangle'),
        labels: getLabelsFromNodeType(node.type || 'rectangle')
      };
    });

    setTasks(generatedTasks);
    setEpics(generatedEpics);
  }, [nodes, edges]);

  const findConnectedComponents = () => {
    const visited = new Set<string>();
    const components: string[][] = [];

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const component: string[] = [];
        dfs(node.id, visited, component);
        if (component.length > 0) {
          components.push(component);
        }
      }
    });

    return components;
  };

  const dfs = (nodeId: string, visited: Set<string>, component: string[]) => {
    visited.add(nodeId);
    component.push(nodeId);

    edges.forEach(edge => {
      if (edge.source === nodeId && !visited.has(edge.target)) {
        dfs(edge.target, visited, component);
      }
      if (edge.target === nodeId && !visited.has(edge.source)) {
        dfs(edge.source, visited, component);
      }
    });
  };

  const getPriorityFromNodeType = (nodeType: string): Task['priority'] => {
    switch (nodeType) {
      case 'triangle': return 'highest';
      case 'diamond': return 'high';
      case 'hexagon': return 'medium';
      case 'rectangle': return 'low';
      default: return 'lowest';
    }
  };

  const getStoryPointsFromNodeType = (nodeType: string): number => {
    switch (nodeType) {
      case 'triangle': return 8;
      case 'diamond': return 5;
      case 'hexagon': return 3;
      case 'rectangle': return 2;
      default: return 1;
    }
  };

  const getLabelsFromNodeType = (nodeType: string): string[] => {
    switch (nodeType) {
      case 'triangle': return ['urgent', 'critical'];
      case 'diamond': return ['decision', 'review'];
      case 'hexagon': return ['preparation', 'setup'];
      case 'rectangle': return ['process', 'development'];
      case 'circle': return ['milestone', 'endpoint'];
      default: return ['general'];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'review': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'blocked': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    const colors = {
      highest: 'text-red-600',
      high: 'text-orange-500',
      medium: 'text-yellow-500',
      low: 'text-green-500',
      lowest: 'text-gray-400'
    };
    return <Flag className={`w-4 h-4 ${colors[priority as keyof typeof colors]}`} />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEpic = selectedEpic === 'all' || 
                         epics.find(epic => epic.id === selectedEpic)?.tasks.includes(task.id);
      
      return matchesFilter && matchesSearch && matchesEpic;
    });
  }, [tasks, filter, searchTerm, selectedEpic, epics]);

  const taskStats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  }), [tasks]);

  const generateDocument = () => {
    const doc = {
      title: 'Workflow Documentation',
      generatedAt: new Date().toISOString(),
      summary: {
        totalTasks: taskStats.total,
        totalEpics: epics.length,
        completionRate: Math.round((taskStats.done / taskStats.total) * 100) || 0
      },
      epics: epics.map(epic => ({
        ...epic,
        tasks: tasks.filter(task => epic.tasks.includes(task.id))
      })),
      tasks: tasks,
      workflow: {
        nodes: nodes.length,
        connections: edges.length
      }
    };

    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-documentation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Workflow Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create a workflow in the Designer to generate tasks automatically
          </p>
        </div>
      </div>
    );
  }

  const statusColumns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-700' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { id: 'review', title: 'Review', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { id: 'done', title: 'Done', color: 'bg-green-100 dark:bg-green-900/30' },
    { id: 'blocked', title: 'Blocked', color: 'bg-red-100 dark:bg-red-900/30' }
  ];

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Task Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Jira-style task management for your workflow
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={generateDocument}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Docs</span>
              </button>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {['board', 'list', 'hierarchy'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === mode
                        ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.todo}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">To Do</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{taskStats.inProgress}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{taskStats.review}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Review</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{taskStats.done}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Done</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{taskStats.blocked}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Blocked</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <select
              value={selectedEpic}
              onChange={(e) => setSelectedEpic(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Epics</option>
              {epics.map(epic => (
                <option key={epic.id} value={epic.id}>{epic.name}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2">
            {['all', 'todo', 'in-progress', 'review', 'done', 'blocked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Board View */}
        {viewMode === 'board' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {statusColumns.map((column) => (
              <div key={column.id} className={`${column.color} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredTasks.filter(task => task.status === column.id).length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {filteredTasks
                    .filter(task => task.status === column.id)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {task.title}
                          </h4>
                          {getPriorityIcon(task.priority)}
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="text-gray-500">{task.storyPoints}pt</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {task.comments > 0 && (
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-500">{task.comments}</span>
                              </div>
                            )}
                            {task.attachments > 0 && (
                              <div className="flex items-center space-x-1">
                                <Paperclip className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-500">{task.attachments}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{task.assignee}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {task.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <span className="text-sm text-gray-900 dark:text-white">
                            {task.status.replace('-', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getPriorityIcon(task.priority)}
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {task.assignee}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {task.storyPoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? 'Create some nodes in the workflow designer to generate tasks'
                : `No tasks with status "${filter.replace('-', ' ')}"`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDashboard;