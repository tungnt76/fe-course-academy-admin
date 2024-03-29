import "./TeacherList.css";
import { DataGrid } from "@material-ui/data-grid";
import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { axiosInstance } from "../../utils/base";

import EditUser from './../EditUser/EditUser';
import { DEFAULT_AVATAR } from "../../config";
import NewUser from './../NewUser/NewUser';
import { Button } from "@material-ui/core";
import { withSnackbar } from "notistack";
import CircularIndeterminate from "../../components/CircularIndeterminate/CircularIndeterminate";

const useStyles = makeStyles({

    dataGrid: {
        width: "100%",
        marginTop: '30px'
    },
});

function TeacherList(props) {
    const classes = useStyles();
    const [data, setData] = useState([]);
    const [editId, setEditId] = useState(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [loadingBar, setLoadingBar] = useState(false);

    async function loadUsers() {
        setLoadingBar(true)
        const res = await axiosInstance.get('/users?role_id=1&limit=999&sort_type=asc');
        setLoadingBar(false)
        if (res.data.users) {
            let users = res.data.users.map((el) => {
                el['user']['role'] = el['role'];
                delete el['role'];
                return el['user'];
            });
            setData(users);
        }
    }
    useEffect(function () {
        loadUsers();
    }, []);

    const handleBlock = async (id) => {
        try {
            setLoadingBar(true)
            const res = await axiosInstance.delete(`/users/${id}`);
            setLoadingBar(false)
            console.log(data)
            if (res.status === 200) {
                // setData(data.filter((item) => item.id !== id));
                await loadUsers();
                props.enqueueSnackbar('Successfully blocked user', { variant: 'success' });
            } else {
                props.enqueueSnackbar('Failed done the operation.', { variant: 'error' });
            }

        } catch (err) {
            props.enqueueSnackbar('Failed done the operation', { variant: 'error' });
        }
    };

    const handleUnblock = async (id) => {
        try {
            setLoadingBar(true)
            const res = await axiosInstance.put(`/users/${id}`, { is_delete: false });
            setLoadingBar(false)
            console.log(data)
            if (res.status === 200) {
                // setData(data.filter((item) => item.id !== id));
                await loadUsers();
                props.enqueueSnackbar('Successfully unblocked user', { variant: 'success' });
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

    const handleCreate = () => {
        console.log('Button clicked')
        setShowAddDialog(true);
    }

    const handleEditOnClick = async (values) => {
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            let fd = new FormData();
            for (let key in values) {
                if (values.hasOwnProperty(key)) {
                    fd.append(key, values[key]);
                }
            }
            setLoadingBar(true)
            const res = await axiosInstance.put(`/users/${editId}`, fd, config);
            console.log(res)
            setLoadingBar(false)
            if (res.status === 200) {
                props.enqueueSnackbar('Successfully updated user', { variant: 'success' });
                await loadUsers();
            } else {
                props.enqueueSnackbar('Failed done the operation.', { variant: 'error' });
            }
            setShowEditDialog(false);
        } catch (err) {
            console.log(err);
            props.enqueueSnackbar('Failed done the operation', { variant: 'error' });
        }

    }

    const handleAddOnClick = async (values, roles) => {
        try {
            let role_id;
            roles.forEach((role) => {
                if (role.name.toLowerCase() === 'teacher') {
                    role_id = role.id;
                }
            })
            const data = { ...values, role_id: role_id }
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            let fd = new FormData();
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    fd.append(key, data[key]);
                }
            }
            const res = await axiosInstance.post(`/users/add-new-user`, fd, config);

            if (res.status === 201) {
                props.enqueueSnackbar('Successfully created user', { variant: 'success' });
                await loadUsers();
            } else {
                props.enqueueSnackbar('Failed done the operation.', { variant: 'error' });
            }
            setShowAddDialog(false);
        } catch (err) {
            props.enqueueSnackbar('Failed done the operation', { variant: 'error' });
        }

    }

    const columns = [
        { field: "id", headerName: "ID", flex: 0.1 },
        {
            field: "avatar", headerName: "Avatar", flex: 0.15,
            renderCell: (params) => {
                return (
                    <img className="userListImg" src={params.row.avatar !== "null" ? (params.row.avatar || DEFAULT_AVATAR) : DEFAULT_AVATAR} alt={params.row.fullname} />
                );
            },
        },
        {
            field: "fullname",
            headerName: "Fullname",
            flex: 0.3,
        },
        { field: "email", headerName: "Email", width: 200 },
        {
            field: "address",
            headerName: "Address",
            flex: 0.3,
        },
        {
            field: "action",
            headerName: "Action",
            flex: 0.2,
            renderCell: (params) => {
                return (
                    <>
                        {params.row.is_delete.data[0] === 0 ?
                            <button className="buttonEdit" variant="contained"
                                onClick={() => handleEdit(params.row.id)}>Edit
                            </button>
                            :
                            <button className="buttonEdit" variant="contained" disabled
                                onClick={() => handleEdit(params.row.id)}>Edit
                            </button>
                        }

                        {params.row.is_delete.data[0] === 0
                            ? <button className="buttonDelete" variant="contained"
                                onClick={() => handleBlock(params.row.id)}>Block
                            </button> : <button className="buttonUnblock" variant="contained"
                                onClick={() => handleUnblock(params.row.id)}>Unblock
                            </button>}

                    </>
                );
            },
        },
    ];

    return (
        <div className="userList">
            <h1>Teacher List</h1>
            <Button className='buttonCreate' variant="contained" color="primary" onClick={() => handleCreate()}>
                Create new teacher
            </Button>
            {loadingBar ? <CircularIndeterminate /> :
                <DataGrid className={classes.dataGrid}
                    rows={data}
                    disableSelectionOnClick
                    columns={columns}
                    pageSize={8}
                    checkboxSelection
                    autoHeight={true}
                >

                </DataGrid>
            }

            {showEditDialog && <EditUser handle={handleEditOnClick} id={editId} toggle={() => setShowEditDialog(false)} />}
            {showAddDialog && <NewUser handle={handleAddOnClick} toggle={() => setShowAddDialog(false)} />}

        </div >
    );


}

export default withSnackbar(TeacherList);