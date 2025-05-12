// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.42
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["光影瞬间鉴证中俄友谊", "中美经贸高层会谈达成重要共识", "中美双方将发布联合声明", "50秒演绎一生对妈妈说的话", "靠岸中国货船数归零 美官员惊到了", "武汉坐地铁公交可以抵扣房贷", "印巴恢复边境降旗仪式：双方威严踢腿", "台媒体人感叹：台湾真的该回家了", "印巴冲突急刹车 原因很“硬核”", "老外难逃中国品牌真香定律", "共7人参加韩国总统大选", "运-20向巴方运送物资？空军辟谣", "印军方称击落“数架”巴基斯坦飞机", "女子上移动厕所不料被带上了高速", "巴西总统卢拉抵京 竖大拇指点赞", "女演员商场表演火裙舞时三度烧伤", "动物园回应悬赏通缉越狱卡皮巴拉", "汶川地震追空投的男孩已成空降兵", "音乐人韩贤光病逝 曾编曲《单身情歌》", "荔枝价格从7字头跌到4字头", "央视主持人朱迅2小时14分跑完半马", "吴敏霞重穿泳衣为女儿示范跳水", "90后女生直播拔鸡屁股毛万人观看", "男孩母亲节帮妈妈卖空花店", "巴萨4-3皇马 姆巴佩戴帽难救主", "S妈晒合照 具俊晔暴瘦", "河南队新帅拉莫斯喜迎上任首胜", "逐句解读中美会谈通稿 有这些关键词", "西藏拉孜发生5.5级地震 有人被晃醒", "杭州77岁儿子每天陪101岁母亲散步", "中国女子4X100米勇夺小组第一", "女子骑电动车闯红灯受伤被定全责", "以色列外长称不允许伊朗拥有核武器", "吴昕主持人的含金量还在上升", "普京说俄中关系是真正典范", "黄磊女儿黄多多出演《人鱼》", "刘强东穿猪猪侠衣服在日本被偶遇", "原来这么干都是无效减重", "阿尔巴尼亚议会选举投票结束", "哈马斯就加沙人道物资准入进行谈判", "印巴停战《印度河用水条约》仍未恢复", "加沙地带多地遭袭 造成至少12人死亡", "周杰伦晒昆凌与小女儿合照", "印巴停火后 印度持续开闸供水", "大学男生失踪1个月后被确认跳入黄河", "镇卫生院回应游客因高反身亡", "东航回应安全出口被乘客打开", "广厦男篮林秉圣：总冠军未夺不言庆功", "省委书记和省长现场观赛 范志毅开球", "江苏宿迁大风接连吹跑5万现金", "苹果16Pro首次参加国补"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
