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

// GetByID godoc
// @Summary  Get a flag by id
// @Tags     flags
// @Produce  json
// @Param    flagId path string true "Flag ID"
// @Success  200 {object} Flag
// @Failure  404
// @Router   /v1/flags/{flagId} [get]
func (h *Handler) GetByID(ctx *gin.Context) {
	id := ctx.Param("flagId")
	f, ok := h.svc.GetByID(id)
	if !ok {
		ctx.Status(http.StatusNotFound)
		return
	}
	ctx.JSON(http.StatusOK, f)
}

// GetAll godoc
// @Summary  Get all flags with the defined tag
// @Tags     flags
// @Produce  json
// @Param    tag query string false "Filter by tag"
// @Success  200 {object} FlagContainer
// @Router   /v1/flags [get]
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

// Update godoc
// @Summary  Enable or disable flag
// @Tags     flags
// @Accept   json
// @Produce  json
// @Param    flagId path string true "Flag ID"
// @Param    body   body FlagUpdateRequest true "Update request"
// @Success  200 {object} Flag
// @Failure  400
// @Failure  404
// @Router   /v1/flags/{flagId} [put]
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
