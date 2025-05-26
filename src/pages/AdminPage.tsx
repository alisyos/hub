import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useOutLink } from '../context/OutLinkContext';
import { OutLinkFormData } from '../types';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { outLinks, loading, error, addOutLink, updateOutLink, deleteOutLink, refreshOutLinks } = useOutLink();
  
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<OutLinkFormData>({
    name: '',
    description: '',
    isApplied: false,
    category: '',
    userPageUrl: '',
    adminPageUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleGoToUser = () => {
    navigate('/');
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      isApplied: false,
      category: '',
      userPageUrl: '',
      adminPageUrl: '',
    });
    setOpen(true);
  };

  const handleEdit = (id: string) => {
    const outLink = outLinks.find(link => link.id === id);
    if (outLink) {
      setEditingId(id);
      setFormData({
        name: outLink.name,
        description: outLink.description,
        isApplied: outLink.isApplied,
        category: outLink.category,
        userPageUrl: outLink.userPageUrl,
        adminPageUrl: outLink.adminPageUrl || '',
      });
      setOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        await deleteOutLink(id);
        setSnackbar({
          open: true,
          message: '아웃링크가 성공적으로 삭제되었습니다.',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: '아웃링크 삭제에 실패했습니다.',
          severity: 'error',
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.category || !formData.userPageUrl) {
      setSnackbar({
        open: true,
        message: '필수 필드를 모두 입력해주세요.',
        severity: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateOutLink(editingId, formData);
        setSnackbar({
          open: true,
          message: '아웃링크가 성공적으로 수정되었습니다.',
          severity: 'success',
        });
      } else {
        await addOutLink(formData);
        setSnackbar({
          open: true,
          message: '아웃링크가 성공적으로 추가되었습니다.',
          severity: 'success',
        });
      }
      setOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: editingId ? '아웃링크 수정에 실패했습니다.' : '아웃링크 추가에 실패했습니다.',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refreshOutLinks}>
              다시 시도
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          아웃링크 관리
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleGoToUser}
          >
            사용자 페이지로 이동
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
          >
            아웃링크 추가
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>명칭</TableCell>
              <TableCell>설명</TableCell>
              <TableCell>카테고리</TableCell>
              <TableCell>적용여부</TableCell>
              <TableCell>사용자 페이지 URL</TableCell>
              <TableCell>관리자 페이지 URL</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {outLinks.map((outLink) => (
              <TableRow key={outLink.id}>
                <TableCell>{outLink.name}</TableCell>
                <TableCell>{outLink.description}</TableCell>
                <TableCell>
                  <Chip label={outLink.category} variant="outlined" size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={outLink.isApplied ? '적용완료' : '미적용'}
                    color={outLink.isApplied ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    size="small"
                    href={outLink.userPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    링크 열기
                  </Button>
                </TableCell>
                <TableCell>
                  {outLink.adminPageUrl ? (
                    <Button
                      variant="text"
                      size="small"
                      href={outLink.adminPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      링크 열기
                    </Button>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(outLink.id)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(outLink.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {outLinks.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            등록된 아웃링크가 없습니다.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
          >
            첫 번째 아웃링크 추가하기
          </Button>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? '아웃링크 수정' : '아웃링크 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="명칭"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="설명"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="카테고리"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="사용자 페이지 URL"
              value={formData.userPageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, userPageUrl: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="관리자 페이지 URL (선택사항)"
              value={formData.adminPageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, adminPageUrl: e.target.value }))}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isApplied}
                  onChange={(e) => setFormData(prev => ({ ...prev, isApplied: e.target.checked }))}
                />
              }
              label="서비스 적용여부"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>
            취소
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            {submitting ? '처리 중...' : (editingId ? '수정' : '추가')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPage; 