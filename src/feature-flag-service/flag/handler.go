package flag

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) GetByID(ctx *gin.Context) {
	id := ctx.Param("flagId")
	f, ok := h.svc.GetByID(id)
	if !ok {
		ctx.Status(http.StatusNotFound)
		return
	}
	ctx.JSON(http.StatusOK, f)
}

func (h *Handler) GetAll(ctx *gin.Context) {
	tag := ctx.Query("tag")
	var flags []*Flag
	if tag != "" {
		flags = h.svc.GetByTag(tag)
	} else {
		flags = h.svc.GetAll()
	}
	ctx.JSON(http.StatusOK, FlagContainer{Results: flags})
}

func (h *Handler) Update(ctx *gin.Context) {
	id := ctx.Param("flagId")
	var req FlagUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil || req.Enabled == nil {
		ctx.Status(http.StatusBadRequest)
		return
	}
	f, err := h.svc.Update(id, *req.Enabled)
	if err != nil {
		if errors.Is(err, ErrFlagNotFound) {
			ctx.Status(http.StatusNotFound)
			return
		}
		var nme *NonModifiableError
		if errors.As(err, &nme) {
			ctx.JSON(http.StatusBadRequest, gin.H{"message": nme.Error()})
			return
		}
		ctx.Status(http.StatusInternalServerError)
		return
	}
	ctx.JSON(http.StatusOK, f)
}
