import ImageView from "./components/ImageView.js"
import Breadcrumb from "./components/Breadcrumb.js"
import Nodes from "./components/Nodes.js"
import Loading from "./components/Loading.js"

import { request, loading_request } from "./api/index.js"

const cache = {}

export default function App($app) {
    this.state = {
        isRoot: false,
        nodes: [],
        depth: [],
        selectedFilePath: null,
        isLoading: false
    }

    const breadcrumb = new Breadcrumb({
        $app,
        initialState: [],
        onClick: (index) => {
            if (index === null) {
                this.setState({
                    ...this.state,
                    depth: [],
                    nodes: cache.root
                })
                return
            }

            if (index === this.state.depth.length - 1) {
                return
            }

            const nextState = { ...this.state }
            const nextDepth = this.state.depth.slice(0, index + 1)

            this.setState({
                ...nextState,
                depth: nextDepth,
                nodes: cache[nextDepth[nextDepth.length - 1].id]
            })
        }
    })

    const imageView = new ImageView({
        $app,
        initialState: this.state.selectedNodeImage
    })

    const loading = new Loading({ $app, initialState: this.state.isLoading });

    this.setState = (nextState) => {
        this.state = nextState
        breadcrumb.setState(this.state.depth)
        nodes.setState({
            isRoot: this.state.isRoot,
            nodes: this.state.nodes
        })
        imageView.setState(this.state.selectedFilePath)
        loading.setState(this.state.isLoading)
    }

    const nodes = new Nodes({
        $app,
        initialState: [],
        onClick: async (node) => {
            try {
                if (node.type === "DIRECTORY") {
                    const nextNodes = await loading_request({
                        nodeId: node.id,
                        setLoading: () => {
                            this.setState({ ...this.state, isLoading: true });
                        },
                        finishLoading: () => {
                            this.setState({ ...this.state, isLoading: false });
                        },
                    });
                    this.setState({
                        ...this.state,
                        isRoot: false,
                        depth: [...this.state.depth, node],
                        nodes: nextNodes,
                    });
                } else if (node.type === "FILE") {
                    this.setState({
                        ...this.state,
                        selectedFilePath: node.filePath
                    })
                }
            } catch (error) {
                throw new Error(error)
            }
        },
        onBackClick: async () => {
            try {
                const nextState = [...this.state]
                nextState.depth.pop()

                const prevNodeId = nextState.depth.length === 0 ? null : nextState.depth[nextState.length = 1].id

                // root 로 온 경우
                if (prevNodeId === null) {
                    const rootNodes = await request()
                    this.setState({
                        ...nextState,
                        isRoot: true,
                        nodes: cache.rootNodes
                    })
                } else {
                    const prevNodes = await request(prevNodeId)
                    this.setState({
                        ...nextNodes,
                        isRoot: false,
                        nodes: prevNodes
                    })
                }
            } catch (error) {
                throw new Error(error)
            }
        }
    })

    const init = async () => {
        try {
            const rootNodes = await loading_request({
                nodeId: null,
                setLoading: () => {
                    this.setState({ ...this.state, isLoading: true });
                },
                finishLoading: () => {
                    this.setState({ ...this.state, isLoading: false });
                },
            });

            // 캐시 추가
            cache.root = rootNodes
        } catch (error) {
            throw new Error(error)
        } finally {
            this.setState({
                ...this.state,
                isLoading: false,
            })
        }
    }

    init()
}