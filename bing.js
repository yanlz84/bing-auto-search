// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.415
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
var default_search_words = ["习近平会见泰国国王哇集拉隆功", "神舟二十二号飞船将在无人状态下发射", "陈冬、陈中瑞、王杰 欢迎回家！", "首台、最大、突破！大国重器好消息不断", "公务员录用体检标准放宽", "国防部：日方若敢铤而走险必付出代价", "编造散布公共领域谣言 网警从严查处", "冷美人回应强制退赛：不甘心", "潘展乐夺得男子100米自由泳金牌", "21岁大学生帮人跨省取快递被判无期", "神二十乘组返回任务取得圆满成功", "南朝四百八十寺之一被烧系谣言", "航天员回地球后第一餐吃啥？菜单来了", "中国游客在巴厘岛出车祸致5死8伤", "四只航天鼠完成任务回地球啦", "寒潮来了！大风雨雪降温在路上", "汪顺全运会200米个人混合泳4连冠", "女子即将结婚 父母取出封存的女儿红", "返回舱成功着陆 神二十乘组状态良好", "神舟二十号航天员乘组安全顺利出舱", "Prada一把不锈钢勺子卖1300元", "荒野求生“冷美人”退赛", "四川舰海试航拍画面来了", "神二十乘组刷新中国航天员新纪录", "女婴被医生违规抱养 已回归原生家庭", "德国总理默茨：乌克兰年轻人别来德国", "美媒爆料：五角大楼改名要花20亿", "陈冬称感谢伟大祖国我们回来了", "被传车祸去世的说唱歌手自宣复活", "外交部回应美方批准新一批对台军售", "国防部：深蓝是航母永恒的方向", "AR详解神舟飞船搜救回收过程", "理想汽车针对2起质量事故处理18人", "提倡零彩礼1年后于东来晒成绩单", "上海通报学校午餐发臭事件", "国防部：希望台湾同胞向“台独”说不", "国台办回应高市早苗涉台错误言论", "外交部三问日方近期军事安全动向", "中柬老缅泰越联合打击跨国电诈犯罪", "范波任江苏省委常委、苏州市委书记", "许昕谈对战马龙：还没打没感受", "1444.49吨！中国探明首个千吨级金矿", "美防长给五角大楼装“战争部”名牌", "泰坦尼克号遇难者怀表将拍卖", "五星红旗和返回舱同框", "“汪汪队”在新领域立大功", "欧盟将取消小包裹免税政策", "39万现金遗忘高铁 众人帮助找回", "小伙高铁上用AI眼镜玩游戏", "巴厘岛车祸系因下坡弯道路段撞树", "陈雨菲全运会第3金"]

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
