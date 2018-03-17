angular
	.module('PVision')
	.factory('shaBiChe', shaBiChe);
/**
 * shabiyihao:  x->turning, y->gravity, z->acc/dec
 * shabierhao:  x->gravity, y->turning, z->acc/dec
 * shabisanhao: x->gravity, y->acc/dec, z->turning
 * shabisihao:  x->acc/dec, y->turning, z->gravity
 * shabiwuhao:  x->acc/dec, y->gravity, z->turning
**/
  function shaBiChe(){
    return{
      shabiyihao: [12125, 12130, 12131],
      shabierhao: [12132],
      shabisanhao: [],
      shabisihao: [12121],
      shabiwuhao: []
    }
  }
