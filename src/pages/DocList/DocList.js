import "./DocList.css";
import { DataGrid } from "@material-ui/data-grid";
import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { axiosInstance } from "../../utils/axios";

import EditDoc from './../EditDoc/EditDoc';
import NewCourse from './../NewCourse/NewCourse';
import { withSnackbar } from "notistack";

const useStyles = makeStyles({

    dataGrid: {
        width: "100%",
        marginTop: '30px'
    },
});

function DocList(props) {
    const classes = useStyles();
    const [data, setData] = useState([]);
    const [editId, setEditId] = useState(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);

    useEffect(function () {
        async function loadDocuments() {
            const res = await axiosInstance.get('/documents?limit=999&sort_type=asc');
            if (res.data) {
                let documents = res.data.map((el) => {
                    el['document']['course'] = el['course'];
                    delete el['course'];
                    return el['document'];
                });
                setData(documents);
            }
        }
        loadDocuments()
    }, []);

    const handleDelete = async (id) => {
        setData(data.filter((item) => item.id !== id));
        try {
            const res = await axiosInstance.delete(`/documents/${id}`);
            console.log(data)
            if (res.status === 200) {
                props.enqueueSnackbar('Successfully deleted documents', { variant: 'success' });
            } else {
                props.enqueueSnackbar('Failed done the operation.', { variant: 'error' });
            }

        } catch (err) {
            props.enqueueSnackbar('Failed done the operation', { variant: 'error' });
        }
    };

    const handleEdit = (id) => {
        setEditId(id);
        setShowEditDialog(true);
    };

    const columns = [
        { field: "id", headerName: "ID", flex: 0.15 },
        {
            field: "name",
            headerName: "Name",
            flex: 0.3,
            renderCell: (params) => {
                return (
                    <div className="docListItem">
                        {/* <img className="docListImg" src={params.row.image || DEFAULT_COURSE_IMAGE} alt="" /> */}
                        {params.row.name}
                    </div>
                );
            },
        },
        {
            field: "course",
            headerName: "Course",
            flex: 0.2,
            renderCell: (params) => {
                return (
                    <div>{params.row.course.name}</div>
                );
            }
        },
        {
            field: "url",
            headerName: "URL",
            flex: 0.5,
        },
        {
            field: "action",
            headerName: "Action",
            flex: 0.2,
            renderCell: (params) => {
                return (
                    <>
                        <button className="buttonEdit" variant="contained"
                            onClick={() => handleEdit(params.row.id)}>Edit
                        </button>

                        <button className="buttonDelete" variant="contained"
                            onClick={() => handleDelete(params.row.id)}>Delete
                        </button>
                    </>
                );
            },
        },
    ];

    return (
        <div className="courseList">
            <h1>Document List</h1>
            <DataGrid className={classes.dataGrid}
                rows={data}
                disableSelectionOnClick
                columns={columns}
                pageSize={8}
                checkboxSelection
                autoHeight={true}
            >

            </DataGrid>

            {showEditDialog && <EditDoc id={editId} toggle={() => setShowEditDialog(false)} />}

        </div >
    );


}

export default withSnackbar(DocList);